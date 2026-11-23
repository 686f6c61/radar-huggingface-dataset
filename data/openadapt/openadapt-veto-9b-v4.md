# OpenAdapt/OpenAdapt-Veto-9B-v4

## Resumen

OpenAdapt-Veto-9B-v4 es un adaptador LoRA de tipo PEFT desarrollado por OpenAdapt sobre el modelo base Qwen/Qwen3.5-9B, un modelo multimodal de tipo image-text-to-text. Su propósito es muy específico: verificar si una acción ejecutada sobre una interfaz gráfica de usuario (GUI) ha tenido realmente éxito. A partir de una captura de pantalla posterior a la acción y una descripción breve del estado esperado, el modelo devuelve una de tres etiquetas: `PASS`, `VETO` o `ABSTAIN`.

El adaptador está pensado para integrarse en OpenAdapt, un arnés de verificación y compilación de flujos de trabajo GUI de código abierto. En escenarios donde un flujo automatizado guarda un formulario en un portal sanitario, un ERP o una aseguradora, el modelo inspecciona la pantalla en busca de errores visuales —valores truncados, banners de validación, modales bloqueantes, reinicios de sesión o sustituciones de caracteres— y detiene la ejecución cuando el resultado es incierto o incorrecto. Esto lo convierte en una pieza de seguridad para automatización de procesos, no en un modelo de propósito general.

El adaptador es extremadamente ligero (unos 111 MB) y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales. La relevancia actual radica en que aborda un problema clásico de la automatización RPA: las acciones que fallan silenciosamente y que los chequeos basados en DOM o ARIA no detectan. El modelo añade una capa de verificación visual con un consumo de memoria moderado (~6,6 GB en VRAM con cuantización 4-bit NF4).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5 (image-text-to-text) |
| Parametros totales | 9B (modelo base Qwen3.5-9B); adaptador LoRA de ~111 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit NF4 (BitsAndBytes), BF16 (pesos fusionados); FP16 para pesos de visión |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, formato PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea LoRA con rango `r=16` y `alpha=32` sobre el modelo base Qwen3.5-9B, que procesa entradas multimodales de imagen y texto. La tarea se formula como una clasificación de tres vías (`PASS`, `VETO`, `ABSTAIN`) con generación restringida a pocos tokens (`max_new_tokens=16`, decodificación greedy). El objetivo de entrenamiento usa una ponderación asimétrica de la pérdida con un factor de penalización de `2,5x` sobre los falsos aceptados, lo que refleja la prioridad del caso de uso: es mucho más grave aceptar una acción fallida que vetar una correcta. Posteriormente se aplica una calibración de temperatura post-hoc (`T=0,95`) ajustada sobre una partición de calibración separada de 100 muestras.

Los datos de entrenamiento son 100% sintéticos y provienen exclusivamente de interfaces de navegador, sin datos de clientes ni información de salud protegida (PHI). La evaluación publicada cubre escenarios de formularios empresariales sintéticos (50 escenarios, 960x640), capturas reales de Chromium headless en dos frameworks de UI no vistos durante el entrenamiento (600 muestras, incluyendo modo oscuro a 1280x800 y Retina al 150% a 1920x1200) y una partición fuera de distribución de 375 muestras. La calibración de temperatura redujo el error de calibración esperado (ECE) de 0,0326 a 0,0242.

## Capacidades

- Verificación visual de éxito de acciones GUI: clasifica el estado posterior a una acción en `PASS`, `VETO` o `ABSTAIN`.
- Detección de fallos silenciosos: valores truncados, banners de validación sin etiqueta, modales ocluidos, controles no vinculados, reinicios de sesión a mitad de flujo y sustituciones de caracteres (homoglifos).
- Procesamiento conjunto de imagen y texto: recibe una captura de pantalla y una descripción textual del estado esperado.
- Modo de abstención calibrada: devuelve `ABSTAIN` cuando la confianza es insuficiente, lo que permite pausar la ejecución en lugar de arriesgar un falso aceptado.
- Integración con verificación de lectura persistida (read-back): combinado con una comprobación independiente del backend, alcanza cobertura de captura de fallos del 100% con 0% de falsos aceptados en los benchmarks publicados.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de tool calling, agentes autónomos ni razonamiento multi-paso más allá de la clasificación de verificación.

## Casos de uso

- Automatización de formularios en portales sanitarios (EHR): tras guardar una historia clínica, el modelo inspecciona la captura posterior y detecta banners de validación ocultos o valores truncados, pausando el flujo antes de que el error se propague a sistemas posteriores.
- Guardado de registros en ERP: en flujos que crean pedidos o facturas, verifica que la confirmación mostrada corresponde realmente al estado esperado y no a un reinicio de sesión silencioso, evitando duplicados o pérdidas de datos.
- Tramitación en portales de seguros: comprueba que las pólizas o siniestros se han registrado correctamente, detectando modales bloqueantes o controles no vinculados que impiden el envío real.
- Verificación en pipelines RPA existentes: se integra como paso de control tras cada acción crítica, sustituyendo o complementando chequeos basados en DOM y ARIA que solo capturan el 34,3% de los fallos en el benchmark publicado.
- Detección de homoglifos y sustituciones de caracteres: en formularios con campos de texto libre, identifica caracteres visualmente similares que corrompen identificadores, correos o códigos postales.
- Control de calidad en entornos de alta escala: con ~6,6 GB de VRAM en 4-bit NF4 y latencia mediana de 1.102 ms en GPU L4, permite desplegar verificación local sin coste por API en cientos o miles de ejecuciones diarias.
- Pausa segura en flujos autónomos: el modo `ABSTAIN` actúa como mecanismo de interrupción cuando la evidencia visual es ambigua, derivando a revisión humana en lugar de continuar a ciegas.

## Benchmarks y rendimiento

Benchmark de formularios web con fallo silencioso (50 escenarios, 35 casos de fallo, 15 controles limpios, noviembre de 2026):

| Modelo / verificador | Tasa de captura de fallos (n=35) | Tasa de falsos aceptados | Tasa de falsos vetos (n=15) | Cobertura 0-WA | Latencia p50 | Coste API / 1k |
|---|---:|---:|---:|---:|---:|---:|
| OpenAdapt-Veto-9B-v4 + read-back persistido | 100,0% (35/35) | 0,0% (0/35) | 20,0% (3/15) | 80,0% | 1.102 ms (L4) | 0,00 $ (local) |
| OpenAdapt-Veto-9B-v4 (solo visual, 4-bit NF4) | 88,6% (31/35) | 11,4% (4/35) | 20,0% (3/15) | 0,0% | 1.102 ms (L4) | 0,00 $ (local) |
| anthropic:claude-sonnet-5-5 | 88,6% (31/35) | 11,4% (4/35) | 26,7% (4/15) | 0,0% | 2.017 ms | 5,53 $ |
| openai:gpt-6.2-sol | 85,7% (30/35) | 14,3% (5/35) | 0,0% (0/15) | 0,0% | 1.520 ms | 2,92 $ |
| gemini:gemini-3.8-flash | 85,7% (30/35) | 14,3% (5/35) | 0,0% (0/15) | 0,0% | 3.742 ms | 0,51 $ |
| DOM + ARIA check only | 34,3% (12/35) | 65,7% (23/35) | 0,0% (0/15) | 0,0% | <1 ms | 0,00 $ |

Evaluación en navegador real no visto (Playwright, n=600, Chromium headless):

| Modelo (4-bit NF4 + visión FP16) | Precisión exacta (n=600) | Tasa de falsos aceptados (n=420) | Cobertura 0-WA (n=180) | Partición HiDPI (n=300) Acc / FA / 0-WA |
|---|---:|---:|---:|---:|
| Qwen/Qwen3.5-4B zero-shot | 75,17% | 19,29% (81/420) | 1,11% | 76,00% / 17,14% / 4,44% |
| Qwen/Qwen3.5-9B zero-shot | 83,83% | 8,10% (34/420) | 0,56% | 82,67% / 10,00% / 0,00% |
| OpenAdapt-Veto-9B-v4 | 98,00% | 1,90% (8/420) | 13,89% | 99,00% / 0,00% / 96,67% |
| OpenAdapt-Veto-9B-v4 + read-back | 100,00% captura de fallos | 0,00% (0/420) | 97,78% (176/180) | 0,00% FA |

Comparación de cuantización (n=600):

| Precisión | VRAM pico | Precisión exacta | Tasa de falsos aceptados |
|---|---:|---:|---:|
| BF16 fusionado | 18,3 GB | 98,33% | 2,00% (dato truncado en la model card) |
| 4-bit NF4 | ~6,6 GB | 98,00% | 1,90% |

En la partición fuera de distribución de 375 muestras, el adaptador redujo los falsos aceptados del 15,54% (Qwen3.5-9B zero-shot) al 7,57% y aumentó la cobertura 0-WA del 16,13% al 17,74%.

## Requisitos de hardware

- VRAM estimada: ~6,6 GB en 4-bit NF4 con pesos de visión en FP16; 18,3 GB con pesos fusionados en BF16.
- GPU recomendadas: NVIDIA L4 (usada en las mediciones de latencia), A100, H100 para despliegues de mayor throughput; RTX 4090 y GPUs consumer con 8 GB o más para 4-bit NF4.
- Cabe en GPU consumer: sí, en 4-bit NF4 con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante).
- Opciones de despliegue: transformers + PEFT + BitsAndBytes (flujo documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia: mediana de 1.102 ms por verificación en GPU L4 con 4-bit NF4; no se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tasa de captura de fallos | Falsos aceptados | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| OpenAdapt-Veto-9B-v4 | 9B (LoRA ~111 MB) | no disponible | 88,6% solo visual / 100% con read-back | 11,4% / 0,0% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (zero-shot) | 9B | no disponible | no disponible | 8,10% (n=420) | Apache-2.0 | Hugging Face |
| anthropic:claude-sonnet-5-5 | no disponible | no disponible | 88,6% | 11,4% | propietaria | API |
| openai:gpt-6.2-sol | no disponible | no disponible | 85,7% | 14,3% | propietaria | API |
| gemini:gemini-3.8-flash | no disponible | no disponible | 85,7% | 14,3% | propietaria | API |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos de interfaces de navegador; el rendimiento en aplicaciones de escritorio nativas, móviles o interfaces no web no está validado.
- Solo soporta inglés; no se han evaluado entradas ni descripciones en otros idiomas.
- En modo solo visual, la tasa de falsos aceptados es del 11,4% en el benchmark de formularios y del 1,90% en la evaluación de navegador real; los fallos de rollback silencioso del backend no son detectables visualmente y requieren verificación de lectura persistida.
- Tasa de falsos vetos del 20% (3/15) en el benchmark de formularios, lo que implica pausas innecesarias en flujos correctos.
- Riesgo de alucinación inherente a los modelos generativos: aunque la salida está restringida a tres etiquetas, la clasificación puede ser errónea ante capturas ambiguas o de baja calidad.
- No se documentan sesgos específicos más allá de la limitación de dominio e idioma.
- Licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el modelo base Qwen3.5-9B debe cumplir su propia licencia (también Apache-2.0 según la model card).
- El adaptador tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por terceros.
- No se documentan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); las métricas publicadas son específicas de la tarea de verificación GUI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenAdapt/OpenAdapt-Veto-9B-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio OpenAdapt: https://github.com/OpenAdaptAI/OpenAdapt
