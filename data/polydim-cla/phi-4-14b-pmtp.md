# polydim-cla/phi-4-14b-pmtp

## Resumen

phi-4-14b-pmtp es un derivado de `microsoft/phi-4` publicado por `polydim-cla` (Ariel García Traba, POLYDIM-EINSOF Research Initiative). Se presenta como un adaptador PMTP sobre una variedad de Stiefel `St(5120, 2048)` en `S^(2047)`, con inyección en la capa 24 y un mecanismo de comunicación entre procesos denominado Zero-Worm IPC sobre `PmtpShmBus`. El modelo base es Phi-4, de 14B, y la licencia declarada del derivado es Apache-2.0.

La propuesta es relevante como experimento de investigación en representaciones geométricas y pensamiento continuo, no como un modelo listo para producción. La model card no incluye datos de entrenamiento, evaluación, idiomas ni instrucciones de carga, y el repositorio ocupa solo 0,3 GB, por lo que no parece contener los pesos completos del modelo base.

Para evaluarlo hay que descargar `microsoft/phi-4` por separado y verificar la compatibilidad del adaptador. No se han publicado benchmarks ni evidencias independientes del beneficio frente al Phi-4 original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Phi-4 (14B) con adaptador PMTP sobre variedad de Stiefel `St(5120, 2048)` en `S^(2047)`; capa inyectada 24; arquitectura base no detallada |
| Parámetros totales | 14B (según nombre y familia del modelo); desglose no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; solo se declaran pesos safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | `microsoft/phi-4` |
| Autor | `polydim-cla` (Ariel García Traba, POLYDIM-EINSOF Research Initiative) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/phi-4` y añade un adaptador PMTP descrito como una inyección geométrica sobre la variedad de Stiefel `St(5120, 2048)` en `S^(2047)`. La model card concreta una proyección de `d_model = 5120` a `d_canonical = 2048`, un defecto de Frobenius de Stiefel de `1.375e-13` calculado con acumulador FP64 Neumaier y una inyección en la capa 24. También describe un mecanismo Zero-Worm IPC de comunicación directa de tensores sobre `PmtpShmBus`, con 0 tokens de texto serializados.

No se detallan datos de entrenamiento: no hay número de tokens, composición del dataset, proceso de alineación (RLHF/DPO), pérdida utilizada ni capas congeladas. Tampoco se especifica si el adaptador modifica únicamente la capa 24 o si afecta a otras partes del modelo base. La terminología empleada —“tensor telepathy”, “Zero-Worm IPC”— no es estándar en la literatura de modelos de lenguaje y no aparece validada de forma independiente en la información disponible.

## Capacidades

- Generación de texto y razonamiento: se hereda presumiblemente del modelo base Phi-4, pero no se documenta ni se evalúa en la model card.
- Código y matemáticas: no hay evaluación específica del adaptador; no disponible.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declara lista de idiomas.
- Mecanismo experimental: inyección geométrica en la capa 24 y comunicación de tensores entre procesos sin serializar texto mediante `PmtpShmBus`.
- Etiqueta `continuous-thought`: aparece en los tags, sin definición operativa ni ejemplos de uso.
- No se documentan capacidades de visión, audio, decodificación especulativa ni atención lineal.

## Casos de uso

- Reproducción de la inyección geométrica: cargar el adaptador sobre Phi-4, verificar la capa 24 y medir el defecto de Frobenius declarado (`1.375e-13`) con acumulador FP64/Neumaier. Es adecuado para validar la implementación numérica descrita.
- Estudio de comunicación entre procesos: probar `PmtpShmBus` para transferir tensores entre procesos sin serializar texto, midiendo latencia, aislamiento y estabilidad. Útil en investigación de sistemas distribuidos.
- Evaluación de representaciones continuas: comparar activaciones y salidas del adaptador frente a Phi-4 base en tareas de razonamiento y matemáticas, para determinar si la inyección geométrica altera el comportamiento de forma medible.
- Análisis de robustez numérica: reproducir el cálculo de `St(5120, 2048)` y comprobar la estabilidad en FP64 y FP32, detectando posibles degradaciones al pasar a precisión reducida.
- Base para experimentos de fine-tuning: usar el adaptador como punto de partida y medir olvido catastrófico, transferencia y sensibilidad a hiperparámetros en dominios concretos.
- Auditoría de artefactos de HuggingFace: inspeccionar los safetensors, metadatos y compatibilidad con `transformers` antes de integrarlo en pipelines de investigación.
- Docencia y divulgación: ilustrar la geometría de Stiefel y los adaptadores en modelos de lenguaje con un caso real, siempre etiquetado como investigación no validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Modelo base Phi-4 de 14B: aproximadamente 28 GB en FP16, 14-16 GB en 8 bits y 8-10 GB en 4 bits. Son estimaciones a partir del tamaño; el adaptador añade una sobrecarga no cuantificada.
- GPU de centro de datos: A100 40/80 GB o H100 80 GB para FP16; A100 40 GB o L40S 48 GB para 8 bits.
- GPU de consumo: RTX 3090/4090 de 24 GB para 8 bits o 4 bits; 16 GB solo con 4 bits y contexto corto, con riesgo de OOM.
- Despliegue: `transformers`/PyTorch para cargar safetensors; vLLM o TGI solo si el adaptador es compatible y se convierte; llama.cpp u Ollama requieren GGUF, que no se incluye en el repositorio.
- El tag `phi4:14b` de Ollama corresponde al modelo base, no al adaptador PMTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la información proporcionada. La siguiente tabla incluye referencias de escala, no una comparación de rendimiento.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `polydim-cla/phi-4-14b-pmtp` | 14B | no disponible | no disponible | Apache-2.0 | HuggingFace; repo de 0,3 GB |
| `microsoft/phi-4` | 14B | no disponible | no disponible | no disponible en la información | HuggingFace; modelo base |
| Qwen2.5-14B | 14B (referencia de escala) | no disponible | no disponible | no disponible | no evaluado en esta ficha |
| Mistral-Nemo-12B | 12B (referencia de escala) | no disponible | no disponible | no disponible | no evaluado en esta ficha |

## Limitaciones y advertencias

- La model card es mínima: no define uso previsto, datos de entrenamiento, número de tokens, composición del dataset ni proceso de alineación (RLHF/DPO).
- No hay benchmarks ni evaluación independiente; no se puede afirmar mejora sobre Phi-4.
- Términos como “Zero-Worm IPC” y “tensor telepathy” no son estándar y no están validados externamente.
- El repositorio de 0,3 GB no contiene los pesos completos de un modelo de 14B; hay que descargar el base y seguir instrucciones que no se proporcionan.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- Riesgo de alucinación y sesgos heredado del modelo base, posiblemente alterado por el adaptador; sin evaluación específica.
- Licencia Apache-2.0 declarada para el derivado; deben revisarse los términos del modelo base y de los datos de entrenamiento antes de uso comercial.
- El tag de Ollama `phi4:14b` apunta al modelo base, no al adaptador; no hay GGUF ni cuantizaciones publicadas.
- `PmtpShmBus` usa memoria compartida entre procesos; revisar aislamiento, permisos y superficie de ataque antes de usarlo en entornos multiusuario.
- No apto para producción sin validación de carga, calidad, latencia y seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/polydim-cla/phi-4-14b-pmtp
- Modelo base: https://huggingface.co/microsoft/phi-4
- Repositorio GitHub: https://github.com/AGT1973/POLYDIM_EINSOF
- Ollama Phi-4: https://ollama.com/library/phi4
- No se han encontrado papers, blogs o demos adicionales en la información proporcionada.
