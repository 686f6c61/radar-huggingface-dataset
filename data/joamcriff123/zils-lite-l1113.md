# joamCriff123/zils-lite-l1113

## Resumen

zils-lite-l1113 es un modelo derivado de Qwen/Qwen3.5-0.8B, publicado por el usuario joamCriff123 en Hugging Face. Se presenta como un "cuerpo de decisión" (decision body) de tipo d3-lite para el pool lite de la subnet 127 de Zils. No se trata, por tanto, de un modelo conversacional de propósito general, sino de un componente especializado con pipeline declarado de `feature-extraction`, orientado a producir representaciones o decisiones dentro de una infraestructura de subred concreta.

El modelo parte de la familia Qwen3.5 en su variante de 0,8B y conserva la licencia Apache-2.0 del modelo base. Cuenta con 852.985.920 parámetros reales según los pesos en safetensors y un repositorio de 1,7 GB. La model card pública es extremadamente escueta: no documenta datos de entrenamiento, composición del dataset, idiomas soportados ni resultados de evaluación, lo que limita seriamente cualquier evaluación objetiva de su calidad.

Su relevancia actual es marginal y muy acotada: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, publicado con fines de integración en un ecosistema específico (Zils, subnet 127). Para desarrolladores e investigadores fuera de ese contexto, su interés es principalmente como ejemplo de fine-tuning ligero sobre un modelo base pequeño con licencia permisiva, no como alternativa práctica a modelos consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B); requiere `custom_code` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una transformer derivada de Qwen/Qwen3.5-0.8B, según declara el campo `base_model` y la propia model card. El repositorio incluye la etiqueta `custom_code`, lo que implica que la carga del modelo requiere código personalizado incluido en el repositorio y no funciona con una configuración estándar de `transformers` sin más. El pipeline declarado es `feature-extraction`, coherente con su función de "decision body" dentro del pool lite de Zils, es decir, un componente que produce representaciones o señales de decisión en lugar de texto libre.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La model card se limita a indicar la licencia Apache-2.0, el modelo base y las etiquetas `decision-model`, `zils` y `d3-lite`, remitiendo a los ficheros LICENSE y NOTICE para las atribuciones del upstream.

## Capacidades

- Extracción de características y generación de representaciones, según el pipeline declarado (`feature-extraction`).
- Función de "cuerpo de decisión" (decision body) para el pool lite de la subnet 127 de Zils, presumiblemente emitiendo decisiones o puntuaciones dentro de ese protocolo.
- Herencia potencial de las capacidades del modelo base Qwen3.5-0.8B, si bien no se documenta ninguna y el fine-tuning podría haberlas alterado o eliminado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Integración en el pool lite de Zils (subnet 127): el uso previsto explícito del modelo es actuar como cuerpo de decisión d3-lite dentro de esa subred, consumiendo entradas y emitiendo decisiones según el protocolo de Zils. Es el único caso de uso documentado por el autor.
- Prototipado de extracción de características: al declarar `feature-extraction` y pesar menos de 1 GB, puede emplearse para obtener embeddings o representaciones de texto en experimentos locales, siempre que se cargue con el `custom_code` del repositorio.
- Base para fine-tuning ligero: sus 853M parámetros y licencia Apache-2.0 lo hacen manejable como punto de partida para ajustes específicos en una sola GPU consumer, aunque el modelo base Qwen3.5-0.8B sería una elección más segura al estar mejor documentado.
- Estudio de ecosistemas de subredes: investigadores interesados en cómo se estructuran los "decision bodies" en infraestructuras tipo subnet pueden inspeccionar el repositorio y su código personalizado como caso de estudio.
- Evaluación comparativa de derivados de Qwen3.5-0.8B: útil para medir cuánto se degrada o especializa un modelo base pequeño tras un fine-tuning no documentado, comparando sus representaciones con las del original.
- Despliegue en entornos con recursos muy limitados: el tamaño del repositorio (1,7 GB) permite alojarlo en máquinas modestas, si bien la falta de documentación sobre latencia y formato de salida complica su puesta en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en precisión nativa (fp32/bf16 según los safetensors publicados); en cuantización de 8 bits rondaría 0,9-1,0 GB y en 4 bits, 0,5-0,6 GB, aunque no se distribuyen pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en precisión nativa; una RTX 3060, RTX 4060 o superior es más que suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` con el código personalizado del repositorio (obligatorio por la etiqueta `custom_code`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y la ausencia de pesos GGUF hace improbable el uso directo en llama.cpp u Ollama sin conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-l1113 | 852.985.920 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Requiere `custom_code`; sin benchmarks ni idiomas declarados |
| Qwen/Qwen3.5-0.8B | ~0,8B (familia) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face (modelo base) | Modelo original, presumiblemente mejor documentado |
| Alternativas de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer comparaciones |

La comparación más directa es con su propio modelo base, Qwen/Qwen3.5-0.8B, del que hereda arquitectura y tamaño. Cualquier otra alternativa de la misma categoría requeriría datos que no se han proporcionado, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe datos de entrenamiento, idiomas, contexto ni evaluación, lo que impide validar su comportamiento antes de desplegarlo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, y el fine-tuning podría haber degradado capacidades del modelo base.
- Dependencia de `custom_code`: la carga exige ejecutar código incluido en el repositorio, lo que introduce un riesgo de seguridad que debe auditarse antes de usarlo en producción.
- Riesgo de alucinación: no evaluado; al ser un derivado de un modelo de 0,8B, la probabilidad de errores factuales es estructuralmente alta si se usa para generación de texto.
- Idiomas y contexto desconocidos: no se puede garantizar soporte del castellano ni una ventana de contexto concreta.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero deben revisarse los ficheros LICENSE y NOTICE del repositorio para confirmar las atribuciones del upstream y cualquier condición adicional.
- Especialización estrecha: su diseño como decision body para la subnet 127 de Zils sugiere que su comportamiento fuera de ese protocolo puede ser impredecible.

## Enlaces

- [Hugging Face: joamCriff123/zils-lite-l1113](https://huggingface.co/joamCriff123/zils-lite-l1113)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales sobre este modelo.
