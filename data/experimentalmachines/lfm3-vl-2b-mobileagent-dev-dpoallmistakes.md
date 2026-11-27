# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes

## Resumen

LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes es un modelo experimental de tipo vision-lenguaje (image-text-to-text) desarrollado por ExperimentalMachines, derivado del modelo base LiquidAI/LFM3-VL-2B. Su proposito es actuar como agente de uso de telefono Android: recibe una captura de pantalla y un objetivo en lenguaje natural, y emite la siguiente accion como JSON compacto. Se trata de un checkpoint de desarrollo, no de un modelo de produccion.

El modelo se construyo mediante un ajuste fino con DPO (Direct Preference Optimization) a nivel de paso sobre 4.163 errores propios del modelo predecesor (OwnHistory). La idea era que el modelo aprendiera del contraste entre sus propias acciones erroneas y el paso humano correcto en la misma pantalla. Sin embargo, el resultado fue un fracaso documentado: la precision de paso de alto nivel en AndroidControl cayo de 0,732 a 0,545, por debajo del umbral de aceptacion de 0,712.

El autor mantiene el modelo publico como resultado negativo reproducible y recomienda explicitamente no usarlo, sino emplear en su lugar el modelo principal LFM3-VL-2B-MobileAgent o el predecesor OwnHistory. Tiene 1.918.181.888 parametros (aproximadamente 1,92 mil millones), un repositorio de 4,1 GB y licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (lfm3_vl) con torre de vision y proyector; adaptador LoRA de lenguaje fusionado en los pesos |
| Parametros totales | 1.918.181.888 (aprox. 1,92 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historico de texto de los ultimos 8 pasos; una captura por paso, redimensionada a un maximo de 880 x 880 px, aprox. 720 tokens de imagen) |
| Tipos de cuantizacion | GGUF 4 bits (Q4_K_M + proyector de vision) disponible en el repo GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B (LiquidAI), una arquitectura vision-lenguaje con torre de vision y proyector congelados durante este ajuste. Sobre el checkpoint OwnHistory (pesos fusionados) se aplico DPO a nivel de paso con beta 0,1, combinado con un 0,5 x SFT sobre el paso preferido. Se entreno un nuevo LoRA de solo lenguaje con rango 64 y alpha 128, que se fusiono en los pesos; el adaptador queda disponible en `lora_adapter/`. La torre de vision y el proyector permanecieron congelados.

Los datos de preferencia se generaron decodificando de forma greedy las propias filas de entrenamiento de OwnHistory. Donde la accion del modelo era incorrecta segun el scorer de AndroidControl, se formo el par (paso humano como preferido, paso propio como rechazado). Se excluyeron las filas con `wait` humano. No se uso entorno, modelo profesor ni datos de benchmark. El modelo produce salida con `` seguido de una accion JSON con coordenadas enteras en rejilla 0-1000, y se decodifica con thinking activado y temperatura 0.

## Capacidades

- Generacion de acciones de agente movil Android a partir de una captura de pantalla y un objetivo en lenguaje natural.
- Produccion de acciones tipadas: `click`, `long_press`, `input_text`, `scroll`, `open_app`, `navigate_back`, `navigate_home`, `keyboard_enter`, `wait`, `answer` y `status`.
- Razonamiento breve en modo thinking (``) antes de cada accion.
- Coordenadas normalizadas a rejilla 0-1000 sobre la captura.
- Mantenimiento de un historico textual de los ultimos 8 pasos (intencion y JSON de accion).
- Respuesta final a preguntas del usuario mediante la accion `answer`.
- Soporte de entrada imagen-texto (una captura por paso).
- No soporta tool calling generico, audio ni vision mas alla de capturas de pantalla. Capacidades multilingues limitadas al ingles.

## Casos de uso

- Investigacion sobre DPO en agentes GUI: el modelo sirve como caso documentado de resultado negativo para estudiar por que el DPO a nivel de paso degrada tipos de accion completos (`open_app`, `wait`, `scroll`).
- Reproduccion de experimentos: permite replicar la receta y los resultados del autor con los mismos datos y configuracion.
- Analisis de colapso de tipos de accion: util para diagnosticar como los pares de preferencia genericos (clics y tecleos erroneos) afectan a la distribucion de acciones.
- Desarrollo de pipelines de evaluacion de agentes moviles en AndroidControl con el scorer del autor.
- Pruebas de formato de salida JSON y decodificacion con thinking en modelos pequenos de 2B.
- Despliegue en telefono mediante el GGUF Q4_K_M para experimentar con inferencia local, siempre en entornos de prueba sin cuentas reales.

## Benchmarks y rendimiento

| Puerta offline | OwnHistory | DPOAllMistakes | Umbral |
|---|---|---|---|
| Precision de paso de alto nivel en AndroidControl | 0,732 | 0,545 | >= 0,712 (falla) |
| Precision terminal `complete` | 0,738 | 0,885 | >= 0,70 |
| dev_answer | 0,868 | 0,875 | >= 0,848 |

El modelo no supero la puerta offline y no fue evaluado en linea. La causa documentada: 3.039 de los 4.163 pares eran clics y tecleos erroneos genericos, y `wait` solo aparecia como lado rechazado, por lo que el DPO redujo esos tipos de accion en todo el espacio. Se observo colapso en `open_app` (0,95 a 0,16), `wait` (0,59 a 0,00) y `scroll` (0,62 a 0,16).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en FP16 para los 1,92 mil millones de parametros; en torno a 1,5-2 GB con el GGUF Q4_K_M.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090; A100 y H100 para lotes grandes o evaluacion.
- Cabe en GPU consumer: si, incluidas GPU de gama media con 4-6 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (libreria declarada, con `custom_code`), llama.cpp u Ollama mediante el GGUF Q4_K_M; vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento AndroidControl | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes | 1,92 B | no disponible (historico 8 pasos) | 0,545 (paso alto nivel) | LFM 1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent-Dev-OwnHistory | 1,92 B | no disponible (historico 8 pasos) | 0,732 (paso alto nivel) | LFM 1.0 | Desarrollo |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | no disponible | LFM 1.0 | Recomendado por el autor |
| LiquidAI/LFM3-VL-2B | 2 B aprox. | no disponible | no disponible | LFM 1.0 | Modelo base |

## Limitaciones y advertencias

- Modelo de investigacion: no debe operar de forma desatendida en un telefono con cuentas, mensajes o pagos reales.
- Falla la puerta offline de AndroidControl (0,545 frente al umbral de 0,712); no fue evaluado en linea y puede ser peor que OwnHistory.
- Colapso de tipos de accion: `open_app`, `wait` y `scroll` se degradan severamente.
- Solo admite objetivos en ingles; una captura por paso y sin memoria mas alla de los 8 pasos de historico textual.
- Riesgo de alucinacion en la interpretacion de la captura y en la eleccion de coordenadas.
- Sesgos: no documentados en la informacion disponible, pero el entrenamiento se limita a datos de AndroidControl y a los errores propios del modelo.
- Licencia LFM Open License v1.0: revisar las condiciones para uso comercial antes de cualquier despliegue.
- El autor recomienda explicitamente usar LFM3-VL-2B-MobileAgent o OwnHistory en lugar de este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes
- Version GGUF: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOAllMistakes-GGUF
- Modelo predecesor: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-OwnHistory
- Modelo recomendado: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Correccion propuesta: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-DPOStopMistakes
- Modelo base original: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/experimentalmachines/lfm3-mobile-agent
- Guia de nombres: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Documentacion de modelos: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados: https://github.com/experimentalmachines/lfm3-mobile-agent/blob/main/docs/results.md
