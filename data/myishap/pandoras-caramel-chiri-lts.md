# myishap/pandoras-caramel-chiri-lts

## Resumen

Pandora's Caramel — Chiri LTS es un modelo neuronal de control de tasa para el codificador de vídeo x264. No es un modelo de lenguaje: predice, para cada escena de un vídeo, cuánto puede desplazarse el CRF (factor de calidad constante) respecto a un ancla definida por el preset del codificador, sin degradar la calidad por debajo de la que obtendría contenido típico en ese mismo ancla. Lo desarrolla myishap como parte del proyecto Pandora, una cadena de herramientas de codificación perceptual, y se publica como el modelo que el sistema usa en producción (`caramel-neural-1.3360-e5d024-m1`).

El modelo resuelve un problema concreto del rate-control en x264: elegir un CRF por escena en lugar de uno global. En vez de fijar un CRF absoluto, sube el CRF del preset para escenas que lo admiten y, raramente, lo baja medio punto para escenas más difíciles de lo que el contenido detallado justifica. La innovación es que la decisión se toma a partir de 27 características extraídas del origen más cuatro derivadas de una codificación rápida de la propia escena, con una red que predice curvas de siete métricas perceptuales sobre CRF.

El repositorio es mínimo (0,0 GB, un fichero de texto de 842 KB) y no contiene pesos en formato tensorial convencional: el modelo se serializa como texto plano interpretado por `caramel-kernel`, una biblioteca Rust con licencia GPL-3.0-or-later. Está entrenado mayoritariamente con anime (3360 escenas de 102 fuentes), lo que condiciona su aplicabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal feed-forward (perceptrón multicapa) con activación SiLU; ensemble de 10 redes (5 folds por serie × 2) más un modelo base solo-fuente |
| Parámetros totales | no disponible (topología 32 → 32 → 32 → 49 por red; fichero de 842 KB en texto) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa una escena por inferencia) |
| Tipos de cuantización | no disponible (el fichero es texto plano con normalización de entradas; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no aplica; el modelo opera sobre señales de vídeo) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | Texto plano propietario (`caramel-model 1`), con cabecera, regla, normalización, curvas `typical` y capas de cada red; incluye el modelo base embebido |

## Arquitectura y entrenamiento

El modelo es un conjunto de diez redes neuronales de tres capas ocultas (32 entradas → 32 → 32 → 49 salidas, activación SiLU), organizadas en cinco folds por serie y dos variantes cada uno, más un modelo base de 28 entradas con ganancia 0,6 embebido en el mismo fichero. Cada red predice 49 valores: siete curvas (XPSNR, XPSNR de los peores fotogramas, SSIM en dB, VMAF, VMAF de los peores fotogramas, banding añadido según CAMBI y log de bits por píxel) evaluadas en siete puntos de CRF. Las curvas son monótonas por construcción. La regla de decisión combina los votos de calidad por métrica y aplica un margen de banding de 1 CRF; la ganancia y el margen son editables a mano en el fichero.

Las entradas son 27 números que describen el origen en la ventana inicial de la escena (ruido σ, SI, densidad de bordes, proporción de bloques lisos/gradiente/gradiente oscuro/line art/oscuro, luma, energía de detalle fino bajo cinco umbrales de ruido, SI y TI de croma, residuales con y sin compensación de movimiento, movimiento, proporción de cambio, energía de residual bajo cinco umbrales, quietud y profundidad de bits) más cuatro derivadas de una codificación rápida (x264 `veryfast`, CRF 20, hasta 48 fotogramas): `fast-xpsnr`, `fast-xpsnr-low`, `fast-bits` y `fast-banding`. El modelo base solo lee las entradas de origen y `exposed-banding`; la codificación rápida solo se ejecuta para escenas que el base subiría.

El entrenamiento usó 3360 escenas de 102 fuentes, mayoritariamente anime, medidas con x264 `fast` y `aq-mode=3:aq-strength=0.8` (preset Standard de Pandora). La validación es por series no vistas: sobre decisiones retenidas en anclas 17–23, el modelo consume aproximadamente 0,91 de los bytes del ancla. El margen de banding se añadió tras el entrenamiento y, en 352 escenas no vistas, redujo el percentil 95 de banding añadido por escenas subidas de 1,48 a 1,26 CAMBI a cambio de un 0,5 % más de bytes con el mismo déficit de calidad.

## Capacidades

- Predicción de curvas de calidad perceptual (XPSNR, SSIM, VMAF, CAMBI y bits por píxel) en función del CRF para una escena concreta.
- Decisión de offset de CRF por escena respecto al ancla del preset, con subida limitada a 6 CRF y bajada excepcional de medio CRF.
- Inferencia en dos fases: modelo base solo-fuente y, solo si la escena se subiría, codificación rápida adicional para refinar la decisión.
- Integración con el servidor Pandora mediante `PUT /api/v1/caramel/model` o copia del fichero a `DB/caramel/models/` con versión en `DB/caramel/active`.
- Soporte de informes vía `pnmpeg --caramel-report` y codificaciones por chunks con presets Caramel.
- Edición manual de parámetros de la regla (`gain`, `banding-margin`) sin reentrenar.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Codificación de anime con rate-control perceptual: el modelo está entrenado sobre todo con anime y ajusta el CRF por escena para gastar menos bytes en escenas fáciles (cielos, planos estáticos) sin perder calidad en las difíciles, usando el ancla del preset como referencia de calidad.
- Distribución de series y películas de animación en archivos de tamaño controlado: al consumir aproximadamente 0,91 de los bytes del ancla en decisiones retenidas, permite reducir el tamaño final manteniendo el déficit de calidad acotado en el percentil 95.
- Control de banding en contenido con degradados: el margen de banding de 1 CRF y la métrica CAMBI permiten limitar el banding añadido en escenas subidas, relevante en animación con fondos degradados.
- Pipelines de codificación por chunks: la integración con `pnmpeg` y los presets Caramel permite aplicar el modelo a codificaciones fragmentadas sin recodificar el vídeo completo.
- Ajuste fino de presets en producción: la posibilidad de editar `gain` y `banding-margin` a mano permite recalibrar el comportamiento (por ejemplo, `gain 0.75` y `banding-margin 1.5` sin test encodes) sin reentrenar, según los datos del autor.
- Evaluación comparativa de estrategias de rate-control: las curvas predichas por escena sirven para analizar el compromiso bytes-calidad antes de codificar, gracias a los informes de `pnmpeg --caramel-report`.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Bytes respecto al ancla | ~0,91 | Decisiones retenidas, anclas 17–23 |
| Déficit de calidad p95 (sin test encodes) | 1,09 unidades (frente a 1,11 con test encodes) | 16256 decisiones retenidas, `gain 0.75`, `banding-margin 1.5` |
| Banding añadido p95 (sin test encodes) | 1,17 CAMBI (frente a 1,23 con test encodes) | 16256 decisiones retenidas |
| Banding añadido p95 (con margen) | 1,26 CAMBI (frente a 1,48 sin margen) | 352 escenas no vistas, 0,5 % más de bytes |
| Coste de bytes del margen de banding | +0,5 % | Mismo déficit de calidad |

No se han publicado resultados de benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es un fichero de texto de 842 KB interpretado por una biblioteca Rust, por lo que la huella de memoria es mínima y no requiere GPU.
- GPU recomendadas: no aplica; la inferencia es en CPU dentro del proceso de codificación.
- Cabe en cualquier GPU consumer e incluso en sistemas sin GPU; el cuello de botella es la codificación rápida x264 (`veryfast`, CRF 20, hasta 48 fotogramas) que se ejecuta solo para escenas que el modelo base subiría.
- Opciones de despliegue: servidor Pandora (`PUT /api/v1/caramel/model`), copia directa del fichero a `DB/caramel/models/`, y `pnmpeg` con presets Caramel. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles de forma absoluta; el coste adicional se limita a la codificación rápida de escenas candidatas a subida, y las escenas que se mantienen en el ancla no incurren en coste extra.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pandora's Caramel — Chiri LTS | Red neuronal de predicción de curvas CRF | Offset de CRF por escena sobre ancla del preset, con ensemble de 10 redes | GPL-3.0-or-later | Hugging Face y repositorio Pandora |
| x264 AQ (adaptive quantization) | Heurística integrada en el codificador | Ajuste de cuantización por bloque/macroblock | GPL-2.0 | Integrado en x264 |
| CRF global | Parámetro del codificador | Un único CRF para todo el vídeo | GPL-2.0 | Integrado en x264 |
| Modelos de rate-control basados en VMAF | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas neuronales de rate-control en la información proporcionada.

## Limitaciones y advertencias

- Medido con una única configuración de x264 (`fast`, `aq-mode=3:aq-strength=0.8`); otros presets o tunes desplazan las curvas y la clave de codificador del fichero indica para cuál fue entrenado.
- Entrenado mayoritariamente con anime; el contenido de acción real está infrarrepresentado y su comportamiento en ese dominio no está validado.
- El CRF de una escena es un offset respecto al ancla; la calidad final en escenas detalladas depende de elegir bien el ancla del preset.
- Las características deben calcularse exactamente como lo hace `caramel-kernel`; el modelo no es portable a otro extractor de características.
- Riesgo de decisiones subóptimas fuera de la distribución de entrenamiento (anclas 17–23, contenido no anime, resoluciones o profundidades de bits no representadas).
- Licencia GPL-3.0-or-later: el uso comercial exige cumplir las condiciones de copyleft de la GPL, lo que puede condicionar su integración en productos propietarios.
- El modelo no es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento; cualquier uso fuera del control de tasa x264 queda fuera de su diseño.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/myishap/pandoras-caramel-chiri-lts
- Repositorio Pandora (toolchain): https://github.com/evilja/pandora-toolchain
- Código de `caramel-kernel` en el commit de referencia: https://github.com/evilja/pandora-toolchain/tree/bf1e26f1d406e0e46efc9973a12d8c94c0b55ddb/caramel-kernel
- Documentación de Caramel: `docs/CARAMEL.md` en el repositorio Pandora
- Documentación de herramientas: `docs/TOOLS.md` en el repositorio Pandora
