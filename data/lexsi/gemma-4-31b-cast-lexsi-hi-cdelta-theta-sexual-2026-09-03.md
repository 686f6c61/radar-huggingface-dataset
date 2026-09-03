# Lexsi/gemma-4-31b-cast-lexsi-hi-cdelta-theta-sexual-2026-09-03

## Resumen

El repositorio `Lexsi/gemma-4-31b-cast-lexsi-hi-cdelta-theta-sexual-2026-09-03` contiene un artefacto de *weight steering* (dirección de pesos) basado en la técnica C-DeltaTheta (contrastive weight-steering), aplicado sobre el modelo base `google/gemma-4-31B-it`. Desarrollado por Lexsi, el objetivo es modificar el comportamiento de rechazo (*refusal*) del modelo ante contenido sexual en hindi, mediante un vector de dirección calculado a partir de dos checkpoints contrastivos (positivo y negativo). El repositorio incluye el vector de dirección, los checkpoints de entrenamiento y un archivo de circuito a nivel de neuronas.

El resultado principal reportado es un efecto nulo: el modelo base ya rechaza contenido sexual en hindi en aproximadamente el 63% de los casos, y el vector de dirección no logra superar ese umbral en ningún punto del barrido de alfa. Aunque el circuito hindi está altamente alineado en signo con el equivalente inglés (94,7%), la tasa base elevada impide cualquier mejora significativa. Este artefacto es relevante para la investigación en interpretabilidad y control de comportamiento de modelos multilingües, pero no ofrece una mejora práctica sobre el comportamiento base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en `google/gemma-4-31B-it`) |
| Parametros totales | No disponible (el vector delta contiene 1.02B parámetros) |
| Parametros activos | No aplica (artefacto de steering, no un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Hindi (idioma de entrenamiento del artefacto; el modelo base puede soportar otros) |
| Licencia | Gemma |
| Formato de pesos | PyTorch (`.pt`), JSON (`.json`); no se especifican safetensors |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un vector de dirección calculado mediante C-DeltaTheta. La técnica consiste en entrenar dos checkpoints sobre el modelo base: uno que fomenta el rechazo (theta+) y otro que fomenta el cumplimiento (theta−) ante contenido sexual en hindi. El vector delta se obtiene como `Delta_theta = M ⊙ (theta+ − theta−)`, donde `M` es una máscara que selecciona canales relevantes (47.577 canales sobre 38 capas MLP). La configuración de entrenamiento incluye: top-15% de MLP, sin atención, exclusión de la primera capa, fuerza de dirección 2.5, tasa de aprendizaje 1e-5, 25 épocas, batch 4, optimizador Adam, con 1800 ejemplos positivos y 1800 negativos. Las pérdidas de los brazos positivo y negativo se redujeron de 5.94 a 2.23 y de 5.74 a 1.88 respectivamente.

El conjunto de datos usado fue `cast-lexsi-hi qc5` (hindi, con control de calidad por panel; 450 ejemplos de entrenamiento y 250 de prueba). El resultado del barrido de alfa (alpha∈[0,4]) mostró que la tasa de rechazo nunca superó el 64.4% base, manteniéndose en un rango de 56–61%. El circuito neuronal identificado está alineado en signo con el equivalente inglés en un 94.7%, y los deltas entrenados son aproximadamente ortogonales a los del inglés (coseno ≈ 0), lo que indica independencia entre las ejecuciones.

## Capacidades

- Modificación del comportamiento de rechazo del modelo base ante contenido sexual en hindi.
- Dirección de pesos a nivel de canales MLP (47.577 canales en 38 capas).
- Proporciona checkpoints positivos y negativos para análisis contrastivo.
- Incluye un archivo de circuito (`circuit.json`) con neuronas relevantes mediante EAP-IG (360 pares de contraste, top 5%).
- No ofrece capacidades generativas propias; depende del modelo base para cualquier tarea de lenguaje.

## Casos de uso

- Investigación en interpretabilidad: el artefacto permite estudiar cómo se distribuye el comportamiento de rechazo en las capas MLP de un modelo multilingüe, y comparar la alineación de circuitos entre idiomas.
- Ajuste de políticas de seguridad: aunque el resultado es nulo en este caso, la metodología puede aplicarse para explorar el steering de rechazo en otros dominios o idiomas donde la tasa base sea más baja.
- Experimentación con técnicas de weight steering: el repositorio sirve como referencia para reproducir configuraciones de C-DeltaTheta y analizar efectos de techo en modelos con alta tasa de rechazo previa.
- Evaluación de robustez multilingüe: permite comparar el comportamiento del mismo modelo en inglés e hindi frente a contenido sensible, usando artefactos equivalentes.
- Desarrollo de herramientas de control de comportamiento: aunque no se logra mejora, el vector y los checkpoints pueden usarse para pruebas de ablación o para combinar con otros métodos de intervención.
- Análisis de ortogonalidad entre direcciones de steering: los datos de coseno ≈ 0 entre los deltas inglés e hindi son útiles para estudiar la independencia de intervenciones en distintos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, etc.) en la información disponible. El único dato de rendimiento reportado es la tasa de rechazo ante contenido sexual en hindi, medida con un juez sindicado (frase en hindi ∨ gpt-5-mini). Los resultados del barrido de alfa son:

| Alfa | Tasa de rechazo |
|---|---|
| 0 (base) | ~63% (reportado como 64.4% en el texto) |
| 1–4 | 56–61% (sin superar el valor base) |

Estos datos indican un efecto nulo del steering, atribuido al techo de la tasa base del modelo.

## Requisitos de hardware

- El repositorio tiene un tamaño de 6.6 GB, que incluye los checkpoints y el vector de dirección.
- Para aplicar el steering se requiere cargar el modelo base `google/gemma-4-31B-it`, que necesita aproximadamente 62 GB de VRAM en precisión fp16 (estimación típica para un modelo de 31B parámetros; no se especifica en la documentación).
- Se recomienda una GPU con al menos 80 GB de VRAM (A100, H100) para inferencia completa; en consumer GPUs (RTX 4090 con 24 GB) no cabría el modelo completo sin cuantización.
- El overhead del vector delta es pequeño (1.02B parámetros adicionales), pero no se proporcionan requisitos específicos de memoria para su aplicación.
- Opciones de despliegue: no se indican herramientas específicas (vLLM, llama.cpp, etc.). El artefacto está en formato PyTorch, por lo que puede integrarse con frameworks de Python que carguen el modelo base y apliquen el delta manualmente.

## Comparativa con modelos similares

No hay información disponible sobre comparaciones con otros modelos de steering o modelos base alternativos. El único punto de referencia mencionado es el artefacto inglés compañero: `Lexsi/gemma-4-31b-cast-lexsi-cdelta-theta-sexual-k2.8`. A continuación se comparan ambos artefactos según los datos reportados:

| Parametro | Artefacto hindi (este) | Artefacto inglés (k2.8) |
|---|---|---|
| Idioma de entrenamiento | Hindi | Inglés |
| Tasa de rechazo base | ~63% | No especificada (punto operativo inglés: 48% tras steering) |
| Resultado del steering | Nulo (no supera 64.4%) | Efectivo (eleva a 48% desde una base inferior) |
| Alineación de circuitos | 94.7% con el inglés | Referencia |
| Ortogonalidad de deltas | Coseno ≈ 0 con el inglés | Referencia |

No se dispone de comparaciones con otros modelos de la misma categoría (por ejemplo, otros artefactos de steering sobre Gemma o modelos de 31B).

## Limitaciones y advertencias

- El artefacto no produce una mejora sobre el comportamiento base: el resultado es nulo y no debe usarse esperando un aumento del rechazo en hindi.
- El contenido está marcado como "not-for-all-audiences" y trata sobre contenido sexual explícito; su uso debe ser exclusivamente en entornos de investigación controlados.
- La licencia Gemma impone restricciones de uso comercial; es necesario revisar los términos exactos de la licencia antes de cualquier aplicación productiva.
- El modelo base no está documentado en este repositorio; se asume que es `google/gemma-4-31B-it`, pero no se verifican sus características (contexto, arquitectura, etc.).
- El artefacto solo cubre el idioma hindi; no hay evidencia de que funcione en otros idiomas o dominios.
- La evaluación se realizó con un juez específico (frase hindi ∨ gpt-5-mini); los resultados pueden variar con otros métodos de evaluación.
- No se proporcionan instrucciones claras de cómo aplicar el vector de dirección al modelo base, lo que dificulta su reproducibilidad directa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lexsi/gemma-4-31b-cast-lexsi-hi-cdelta-theta-sexual-2026-09-03
- Artefacto inglés compañero (mencionado): https://huggingface.co/Lexsi/gemma-4-31b-cast-lexsi-cdelta-theta-sexual-k2.8 (enlace inferido, no verificado en la información proporcionada)

No se encontraron otros enlaces relevantes en la búsqueda web (los resultados obtenidos correspondían a foros ajenos al tema).
