# muyleanging/VoxPocket-v6

## Resumen

VoxPocket v6 es un modelo de texto a voz (TTS) especializado en jemer (khmer) e inglés, desarrollado por Ing Muyleang y distribuido bajo un modelo comercial de pago. Se construye sobre la arquitectura VoxCPM 1.5 de OpenBMB y cuenta con 0,89 mil millones de parámetros, una frecuencia de muestreo de salida de 44,1 kHz y capacidad de clonación de voz a partir de un clip de 4 a 10 segundos sin necesidad de transcripción. Su propuesta diferencial es cubrir el jemer, un idioma con escasa representación en sistemas TTS comerciales, junto con inglés y texto mixto jemer-inglés en una misma llamada.

El modelo resuelve el problema de la síntesis de voz natural y expresiva en jemer con mezcla de código (code-mixing), un escenario habitual en contextos profesionales y educativos de Camboya donde se intercalan términos en inglés. Ofrece 11 estilos de locución (neutro, alegre, triste, excitado, calmado, susurro, enfadado, sorprendido, lector de noticias, amigable y suave), diseño de voz mediante descripción textual y generación de texto largo mediante segmentación por frases.

La relevancia actual radica en su eficiencia: con 0,89B de parámetros y un pico de 5,0 GB de VRAM en generación, supera en velocidad a modelos casi tres veces mayores como VoxCPM2 (2,38B) con un factor de tiempo real de 0,28 frente a 0,38. Los pesos no son públicos: el acceso se realiza vía API REST y MCP, licencia on-premise o voz personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en VoxCPM 1.5 (OpenBMB); detalles internos no disponibles |
| Parametros totales | 0,89B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; una llamada fiable hasta ~600 letras |
| Tipos de cuantizacion | No disponible (inferencia en bf16 según benchmarks) |
| Idiomas soportados | Jemer (km), inglés (en) y texto mixto jemer-inglés |
| Licencia | voxpocket-commercial (licencia de pago, pesos no públicos) |
| Formato de pesos | No disponible (no descargables) |

## Arquitectura y entrenamiento

El modelo se construye sobre VoxCPM 1.5 de OpenBMB, una arquitectura TTS de la que no se detallan los componentes internos en la información disponible. La salida se genera a 44,1 kHz, frecuencia superior a la habitual en TTS (16-24 kHz), lo que sugiere un vocoder de alta fidelidad. El modelo opera con clonación de voz zero-shot a partir de un clip de 4-10 segundos sin transcripción, y admite configuración de inferencia con cfg 2.0 y 10 pasos.

El entrenamiento acumula 1.256 horas de datos en la versión v6, ampliadas en v6.2 con 164 horas adicionales de habla larga (22-44 segundos). La versión v6.3 rebalancea el corpus con 8.000 filas en inglés, 6.000 mixtas, 4.000 en jemer y 6.000 de texto largo. No se especifica en la información proporcionada si hubo RLHF, DPO ni la composición exacta del dataset más allá de estos recuentos por versión.

## Capacidades

- Síntesis de voz en jemer, inglés y texto mixto jemer-inglés en una misma llamada.
- Clonación de voz a partir de un clip de 4-10 segundos sin necesidad de transcripción (modo voice-clip-only desde v6.1).
- Diseño de voz mediante descripción textual, sin clip de referencia.
- 11 estilos de locución: neutro, alegre, triste, excitado, calmado, susurro, enfadado, sorprendido, lector de noticias, amigable y suave.
- Generación de texto largo mediante `generate_long()`, con segmentación automática por frases.
- Salida de audio a 44,1 kHz.
- Inferencia más rápida que tiempo real (RTF 0,28 en RTX 5090 con bf16).
- Acceso vía API REST y MCP, licencia on-premise o voz personalizada.

## Casos de uso

- Lector de noticias automatizado en jemer: el estilo "news reader" y la generación de texto largo con `generate_long()` permiten sintetizar artículos completos con una voz consistente, segmentando por frases para evitar saltos.
- Atención al cliente telefónica en Camboya: la mezcla jemer-inglés cubre conversaciones donde el usuario intercala términos técnicos o comerciales en inglés, con el estilo "friendly" para un tono adecuado.
- Audiolibros y contenido educativo: la clonación de voz con un clip corto permite mantener una voz de narrador coherente a lo largo de capítulos, y el modo de texto largo gestiona párrafos de 320-475 letras con una tasa de error media del 3,4%.
- Doblaje y localización de vídeo: el diseño de voz por descripción textual permite crear voces sin disponer de un locutor de referencia, útil para prototipado rápido de personajes.
- Asistentes de voz embebidos: con 2,0 GB de VRAM tras la carga y 5,0 GB de pico, el modelo cabe en GPUs de consumo y puede desplegarse on-premise en dispositivos con recursos limitados.
- Accesibilidad: conversión de texto a voz en jemer para lectores de pantalla y aplicaciones de accesibilidad, con estilos como "calm" o "soft" para sesiones prolongadas.
- Generación de contenido para redes sociales: los 11 estilos y el modo susurro o excitado permiten producir variaciones expresivas de un mismo guion sin reentrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor. Todos los modelos usan las mismas voces, textos y ajustes (clip de voz únicamente, cfg 2.0, 10 pasos, seed 0). La métrica es el error de letra medido por el ASR propio "Sota" (espacios y puntuación eliminados); el suelo de error de Sota en habla limpia es ~1%.

Clips cortos (283 clips: 3 voces × 11 estilos × jemer/inglés/mixto, más diseño de voz):

| Modelo | Error medio | Perfectos | Clips malos | Inglés | Jemer | Mixto |
|---|---|---|---|---|---|---|
| VoxCPM2 | 6,5% | 129 | 16 | 11,3% | 0,8% | 3,1% |
| VoxPocket v6.1 | 2,3% | 160 | 0 | 3,0% | 0,3% | 3,0% |
| VoxPocket v6.2 | 4,0% | 154 | 6 | 6,4% | 0,4% | 3,1% |
| VoxPocket v6.3 | 2,7% | 161 | 3 | 3,8% | 0,3% | 3,1% |

Texto largo en una llamada (10 párrafos de 320-475 letras × 3 voces, 174 frases):

| Modelo | Error medio | Mediana | Frases omitidas |
|---|---|---|---|
| VoxCPM2 | 2,9% | 2,6% | 1 / 174 |
| VoxPocket v6.1 | 15,1% | 13,9% | 26 / 174 |
| VoxPocket v6.2 | 2,8% | 2,4% | 1 / 174 |
| VoxPocket v6.3 | 3,4% | 2,5% | 0 / 174 |

Longitud de texto en una llamada (3 voces, RTX 5090):

| Letras | 50 | 100 | 200 | 400 | 600 | 800 | 1.000 |
|---|---|---|---|---|---|---|---|
| VoxCPM2 | 5,3% | 4,7% | 3,6% | 1,9% | 2,5% | 12,3% | 110% |
| VoxPocket v6.2 | 4,7% | 4,4% | 2,5% | 3,2% | 3,4% | 9,4% | 83% |
| VoxPocket v6.3 | 4,1% | 4,1% | 2,4% | 2,6% | 6,5% | 37,5% | 65% |

Recursos (RTX 5090, PyTorch bf16, mismos ajustes):

| Métrica | VoxPocket v6.3 | VoxCPM2 |
|---|---|---|
| Parámetros | 0,89B | 2,38B |
| VRAM tras carga | 2,0 GB | 5,0 GB |
| VRAM pico en generación | 5,0 GB | 24,1 GB |
| RAM pico | 6,3 GB | 10,7 GB |
| Tiempo de carga | 10 s | 18 s |
| Factor de tiempo real (menor es más rápido) | 0,28 | 0,38 |

## Requisitos de hardware

- VRAM tras carga: 2,0 GB. VRAM pico durante generación: 5,0 GB (medido en RTX 5090 con bf16).
- RAM pico: 6,3 GB.
- GPU de referencia en los benchmarks: RTX 5090. No se publican mediciones en A100, H100 ni RTX 4090.
- Cabe en GPUs de consumo: el pico de 5,0 GB permite ejecución en tarjetas con 8 GB o más de VRAM; no se especifican requisitos mínimos oficiales.
- Tiempo de carga: 10 segundos en RTX 5090.
- Throughput: factor de tiempo real de 0,28, es decir, aproximadamente un 26% más rápido que tiempo real en la GPU de referencia.
- Opciones de despliegue: API REST y MCP gestionados por el autor, o licencia on-premise. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI; al no ser pesos públicos, el despliegue local solo está disponible bajo licencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | VRAM pico | RTF | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxPocket v6.3 | 0,89B | Jemer, inglés, mixto | 5,0 GB | 0,28 | voxpocket-commercial (pago) | API, on-premise, voz personalizada; pesos no públicos |
| VoxCPM2 | 2,38B | No disponible en la información | 24,1 GB | 0,38 | No disponible | Usado como referencia comparativa por el autor |
| VoxPocket v5 (VoxPocket-TTS-Khmer) | No disponible | Jemer | No disponible | No disponible | Abierta (modelo gratuito) | Pesos públicos en Hugging Face |

## Limitaciones y advertencias

- Los pesos no son públicos ni descargables: el uso requiere contratar licencia, API o servicio on-premise. La licencia es de pago y específica del proveedor.
- Una llamada es fiable hasta unas 600 letras; por encima, todos los modelos comparados degradan. Para textos largos debe usarse `generate_long()` con segmentación por frases.
- El conjunto de evaluación es reducido: 3 voces, una de ellas la del propio autor, lo que limita la generalización de los resultados.
- La evaluación se realiza con un ASR propio ("Sota") cuyo suelo de error en habla limpia es ~1%, por lo que las métricas no son directamente comparables con otras publicaciones.
- En clips cortos mixtos jemer-inglés persisten 3 clips malos de 283 (VoxCPM2 tiene 9).
- En texto largo, v6.3 mantiene 0 frases omitidas pero eleva el error medio a 3,4% frente al 2,8% de v6.2; existe un compromiso entre cobertura y precisión entre subversiones.
- En una sola llamada, el error crece de forma acusada a partir de 800 letras (37,5% a 800 y 65% a 1.000 en v6.3).
- Riesgo de suplantación de identidad: el autor prohíbe explícitamente clonar voces de personas reales sin permiso. Es un riesgo relevante en producción y requiere controles de consentimiento.
- No se documentan sesgos lingüísticos, demográficos ni de acento en la información disponible.
- No se especifican restricciones de uso comercial más allá de la licencia `voxpocket-commercial`; deben consultarse los términos enlazados por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muyleanging/VoxPocket-v6
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/muyleanging/VoxPocket-v6-Demo
- Modelo abierto v5 (jemer): https://huggingface.co/muyleanging/VoxPocket-TTS-Khmer
- Licencia y formulario de contacto: https://muyleanging.github.io/voxpocket-web/#license
- Modelo base VoxCPM 1.5 (OpenBMB): https://huggingface.co/openbmb/VoxCPM1.5
- Contacto del autor: muyleanging@gmail.com
