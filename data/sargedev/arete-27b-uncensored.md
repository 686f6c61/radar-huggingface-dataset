# SargeDev/Arete-27B-Uncensored

## Resumen

Arete-27B-Uncensored es una variante "abliterated" (sin mecanismos de rechazo) del modelo NousResearch/Arete-27B, que a su vez es un ajuste fino supervisado (SFT) de parametros completos de Qwen3.8-27B orientado a alineamiento de valores. El modelo lo publica el usuario SargeDev en Hugging Face y su proposito es eliminar la direccion de rechazo del modelo base para que responda a peticiones que el original declinaria. Cuenta con 26.895.998.464 parametros (aproximadamente 26,9 mil millones) en precision bf16 y un repositorio de 54,7 GB distribuido en 28 shards.

La intervencion se realizo con la herramienta OBLITERATUS en modo `--method aggressive`, aplicando ablacion de la direccion de rechazo sobre 15 capas consideradas "fuertes" (las 59-63 son las mas intensas). Segun la model card, tras la edicion se midieron puertas de calidad: coherencia 1.0, divergencia KL de 0,90 frente al base y perplejidad que sube de 3,22 a 3,93, un incremento moderado. Los tensores del drafter MTP/nextn se conservan, por lo que la decodificacion especulativa con la cabeza estandar de Qwen3.8 sigue funcionando.

Es relevante ahora porque no existia previamente una version abliterated de Arete-27B y porque el autor publica una bateria de cumplimiento de 15 prompts duros (desarrollo de exploits, red-team, malware, DoS) con resultado 15/15 entregados en bf16. La licencia declarada es Apache 2.0, lo que facilita su reutilizacion, aunque las implicaciones eticas y legales del caso de uso son responsabilidad del desplegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8, tag `qwen3_5_text`), con cabeza MTP/nextn para decodificacion especulativa |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 publicado por el autor; la model card menciona variantes comunitarias GGUF, EXL3 y NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 28 shards, 53,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3.8-27B a traves de NousResearch/Arete-27B, un SFT de parametros completos orientado a alineamiento de valores. Sobre esa base, SargeDev aplico una ablacion de la direccion de rechazo con OBLITERATUS en modo agresivo, en precision bf16, usando un conjunto de contraste de 842 prompts de tipo harm/harmless. La edicion afecta a 15 capas, siendo las capas 59-63 las de mayor intensidad de senal de rechazo.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica documentada es la preservacion de los tensores del drafter MTP/nextn, lo que mantiene operativa la decodificacion especulativa con la cabeza estandar de Qwen3.8. Las metricas de control publicadas tras la ablacion son coherencia 1.0, KL de 0,90 frente al base y perplejidad de 3,93 (frente a 3,22 del base).

## Capacidades

- Generacion de texto y razonamiento general, heredados de la base Qwen3.8-27B.
- Respuesta a peticiones que el modelo alineado rechazaria, tras la ablacion de la direccion de rechazo.
- Decodificacion especulativa funcional gracias a la conservacion de los tensores MTP/nextn.
- Capacidad de seguir instrucciones y mantener coherencia (coherencia medida de 1.0 tras la edicion).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como se comporta una red sin direccion de rechazo y comparar respuestas frente al base Arete-27B, usando la bateria de 15 prompts duros como referencia reproducible.
- Red teaming y evaluacion de robustez: util para generar cargas de prueba (exploits, phishing, DoS) en entornos controlados y medir la eficacia de filtros y clasificadores de seguridad aguas arriba.
- Generacion de contenido creativo sin restricciones tematicas: ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo base declinaria; requiere revision editorial humana.
- Analisis de textos sensibles: resumen y extraccion de informacion de documentos que contienen lenguaje violento o ilegal (informes forenses, denuncias), sin que el modelo se bloquee por el contenido.
- Pruebas de pipelines de inferencia: al conservar el drafter MTP/nextn, sirve para validar despliegues con decodificacion especulativa en vLLM u otros motores que soporten la cabeza de Qwen3.8.
- Experimentacion con cuantizaciones: la existencia de variantes comunitarias GGUF, EXL3 y NVFP4 permite evaluar la degradacion de calidad y de cumplimiento segun el nivel de cuantizacion.
- Formacion y divulgacion tecnica: demostraciones sobre ablacion de direcciones en espacios de activacion y su efecto medible en perplejidad y KL.

## Benchmarks y rendimiento

| Prueba | Resultado | Notas |
|---|---|---|
| Bateria de cumplimiento (15 prompts duros) | 15/15 entregados en bf16 | Un respuesta larga trunco por umbral de 2500 caracteres, verificada completa al repetir |
| Variantes comunitarias GGUF/EXL3/NVFP4 | 14-15/15 | Un artefacto de muestreo en phish-kit se verifico como entrega al reintentar |
| Coherencia tras ablacion | 1.0 | Metrica declarada por el autor |
| Divergencia KL frente al base | 0.90 | Metrica declarada por el autor |
| Perplejidad | 3.93 (base: 3.22) | Incremento moderado |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos, mas cache KV y overhead; en la practica requiere 60-70 GB o mas segun contexto.
- En cuantizacion de 8 bits: alrededor de 27-30 GB de VRAM; en 4 bits: alrededor de 14-16 GB, aunque las variantes cuantizadas no las publica el autor en este repositorio.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB, o dos GPU de 48 GB en paralelo (por ejemplo, 2x RTX A6000 o 2x L40S).
- Cabe en GPU de consumo solo con cuantizacion: una RTX 4090 de 24 GB admite el modelo en 4 bits con contexto limitado; en bf16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM y TGI para bf16 con decodificacion especulativa (gracias a los tensores MTP/nextn); llama.cpp u Ollama para variantes GGUF comunitarias; TensorRT-LLM y motores con soporte EXL3/NVFP4 para las cuantizaciones comunitarias.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SargeDev/Arete-27B-Uncensored | 26,9 mil millones | no disponible | Abliterated sobre Arete-27B (Qwen3.8) | Apache 2.0 | Hugging Face, bf16 |
| NousResearch/Arete-27B | no disponible | no disponible | SFT de alineamiento de valores sobre Qwen3.8-27B | no disponible | Hugging Face (base) |
| SargeDev/JEV-27B-Uncensored | no disponible | no disponible | Abliterated con bloque de decision AutoTrust System-1 sobre backbone Qwen3.8-27B de huihui | no disponible | Hugging Face |
| SargeDev/JEV-27B-VL-Uncensored | no disponible | no disponible | Igual que JEV-27B-Uncensored con capacidad de vision | no disponible | Hugging Face |

## Limitaciones y advertencias

- La ablacion de la direccion de rechazo elimina salvaguardas: el modelo puede producir contenido danino (exploits, malware, phishing) sin filtro, lo que exige controles externos en cualquier despliegue.
- La perplejidad sube de 3,22 a 3,93, lo que indica una degradacion medible de la calidad del modelado del lenguaje; puede traducirse en mayor tasa de errores factuales o incoherencias en textos largos.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de veracidad y la edicion agresiva puede afectar a la calibracion.
- Idiomas soportados no documentados; se desconoce el comportamiento fuera del ingles y el chino de la base Qwen.
- Longitud de contexto no documentada en la model card; conviene verificarla contra la del base Qwen3.8-27B antes de usarla en produccion.
- Las cuantizaciones comunitarias (GGUF, EXL3, NVFP4) muestran 14-15/15 en la bateria de cumplimiento, no el 15/15 del bf16; el comportamiento puede variar entre cuantizaciones.
- Aunque la licencia es Apache 2.0, el uso comercial del modelo queda sujeto a la legislacion aplicable sobre generacion de contenido danino; el desplegador asume la responsabilidad legal.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente de la comunidad ni informes de terceros sobre su comportamiento real.
- El autor no publica evaluaciones estandar de capacidades (MMLU, HumanEval, GSM8K), por lo que no se puede comparar su rendimiento general con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante relacionada JEV-27B-Uncensored: https://huggingface.co/SargeDev/JEV-27B-Uncensored
- Variante relacionada JEV-27B-VL-Uncensored: https://huggingface.co/SargeDev/JEV-27B-VL-Uncensored
