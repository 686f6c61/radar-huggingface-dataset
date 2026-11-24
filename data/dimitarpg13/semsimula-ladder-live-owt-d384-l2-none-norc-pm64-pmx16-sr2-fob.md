# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la familia Semantic Simulation (SemSimula), una línea experimental que abandona la arquitectura transformer y el mecanismo de atención en favor de un núcleo conservativo basado en mecánica lagrangiana y potenciales escalares. Este checkpoint concreto (FO-b-PMX) entrena ese núcleo como un flujo de gradiente de primer orden verdadero, con 64 pozos de memoria en modo Poisson, sobre OpenWebText.

El modelo forma parte de un estudio escalonado ("ladder study") pre-registrado que compara pares de modelos entrenados con dinámica de segundo orden (con velocidad e inercia) frente a primer orden (sin velocidad), manteniendo constante todo lo demás. Su relevancia es metodológica más que de producto: sirve para aislar si la dinámica de segundo orden aporta ganancia medible cuando existen mecanismos de memoria explícitos. El resultado declarado es que, con los 64 pozos Poisson activos, el gemelo de primer orden iguala al de segundo (54,02 frente a 54,63 de perplejidad), lo que el autor interpreta como una sustitución de la memoria inercial por la memoria estructural de los pozos.

Se trata de un modelo pequeño de investigación (repo de 0,3 GB), con vocabulario y entrenamiento exclusivamente en inglés, licencia CC-BY-4.0 y pesos en formato PyTorch. No está pensado para producción ni para uso general, sino para reproducir y auditar el experimento de ablación de mecanismos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; núcleo conservativo (modelo basado en energía, potencial escalar, mecánica lagrangiana) con 64 pozos de memoria en modo Poisson y dinámica de primer orden (flujo de gradiente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (evaluación a bloque de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (librería pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo pertenece a la generación 3 de SemSimula y se describe como "fully-conservative": la dinámica se deriva de un potencial escalar y se integra con un esquema tipo BAOAB (integrador de dinámica de Langevin) sobre una geometría riemanniana con métrica de Jacobi y geodésicas riemannianas. No hay atención ni mecanismo transformer; la inferencia se declara de memoria constante. La variante PMX añade 64 pozos de memoria en modo Poisson (etiqueta pm64, con pmx16 asociado al estudio de ablación), que actúan como atractores donde se almacena información. En este checkpoint (sufijo fob, "first-order b") los pozos y los modos rígidos se relajan exactamente y no existe variable de velocidad: es un flujo de gradiente puro de primer orden.

El entrenamiento usa OpenWebText (Skylion007/openwebtext) con un presupuesto exacto de 532.480.000 tokens (32.500 pasos × 32 × 512), el mismo presupuesto y calendario que el resto de la escalera Gen 3. La evaluación se realiza sobre los tokens de validación propios de OpenWebText con bloques de 512. El experimento está pre-registrado con cuatro predicciones (FBX1-FBX4): dos fallaron (FBX1 y FBX2, que anticipaban ventaja del segundo orden) y dos acertaron (FBX3, los pozos ayudan a un modelo de primer orden, con −11,7% frente al modelo sin pozos; y FBX4, estabilidad de entrenamiento de los pozos en primer orden). No se documenta RLHF, DPO ni ajuste por preferencias.

## Capacidades

- Generación de texto autoregresiva en inglés, con perplejidad de validación declarada sobre OpenWebText.
- Modelado de lenguaje a nivel de token con ventana de bloque de 512 tokens en la configuración evaluada.
- Inferencia de memoria constante, según la etiqueta del autor (constant-memory-inference), derivada del núcleo conservativo sin atención.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades de visión, audio, modo "thinking" ni matemáticas.
- Capacidad especial: los 64 pozos de memoria Poisson como mecanismo de almacenamiento de información, objeto del estudio de ablación.

## Casos de uso

- Reproducción de experimentos de ablación: el checkpoint permite replicar el par de primer orden frente a segundo orden con 64 pozos y verificar la perplejidad declarada de 54,02 sobre la validación de OpenWebText.
- Investigación en modelos basados en energía: sirve como banco de pruebas para estudiar si la dinámica de segundo orden aporta ganancia cuando existen mecanismos de memoria explícitos, con un diseño pre-registrado y presupuesto de tokens fijo.
- Estudio de arquitecturas sin atención: útil para medir el comportamiento de un núcleo conservativo con inferencia de memoria constante frente a baselines transformer de tamaño comparable.
- Análisis de estabilidad de entrenamiento: el resultado FBX4 (los pozos de primer orden entrenan de forma estable) convierte al modelo en referencia para estudiar la relajación exacta de modos rígidos en flujos de gradiente.
- Docencia e investigación sobre mecánica lagrangiana aplicada a aprendizaje automático: el modelo materializa conceptos de potencial escalar, geodésicas riemannianas e integración BAOAB en un artefacto ejecutable.
- Evaluación comparativa de perplejidad en corpus de código y texto: el mismo diseño se replica en la escalera sobre Python y TinyStories, lo que permite contrastar dominios con el mismo presupuesto de 315M o 532,5M de tokens.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo (OpenWebText, 532,5M tokens) | Orden | Perplejidad validación (bloque 512) |
|---|---|---|
| PMX (64 pozos, segundo orden) | 2.º | 54,63 |
| FO-b-PMX (este modelo, 64 pozos, primer orden) | 1.º | 54,02 |
| PMX-K16 (16 pozos, segundo orden) | 2.º | 54,24 |
| FO-b-PMX-K16 (16 pozos, primer orden) | 1.º | 53,73 |
| PM2-PMX16 (2 pozos, segundo orden) | 2.º | 54,71 |
| FO-b-PM2-PMX16 (2 pozos, primer orden) | 1.º | 53,81 |
| SR2 (sin pozos, segundo orden) | 2.º | 58,32 |
| FO-b-OWT (sin pozos, primer orden) | 1.º | 61,16 |

Detalle de este checkpoint: perplejidad asentada 54,02 (media de las tres últimas evaluaciones de 500 pasos: 53,95, 54,16 y 53,96); mejor valor 52,18 en el paso 31.000. El autor reporta que la diferencia de −1,1% frente a su gemelo de segundo orden es un empate dentro de la dispersión plausible entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo pequeño que probablemente cabe en GPU de consumo, pero no se publican parámetros totales ni requisitos oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada oficialmente; por el tamaño del repo (0,3 GB) es plausible en tarjetas con 8-16 GB, pero debe verificarse.
- Opciones de despliegue: el modelo se distribuye como pesos PyTorch con librería pytorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no ser transformer es improbable que funcione en esos motores sin adaptación.
- Latencia y throughput: no disponible. La model card solo declara inferencia de memoria constante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OpenWebText) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FO-b-PMX (este modelo) | no disponible | no disponible (eval. a 512) | 54,02 | CC-BY-4.0 | Hugging Face, 864 descargas |
| PMX (gemelo de segundo orden) | no disponible | no disponible (eval. a 512) | 54,63 | CC-BY-4.0 | Hugging Face |
| FO-b-OWT (primer orden sin pozos) | no disponible | no disponible (eval. a 512) | 61,16 | CC-BY-4.0 | Hugging Face |
| SR2 (segundo orden sin pozos) | no disponible | no disponible (eval. a 512) | 58,32 | CC-BY-4.0 | Hugging Face |

No se dispone de comparación con modelos transformer de propósito general de tamaño equivalente, ya que la información proporcionada no incluye sus métricas sobre el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción, atención al cliente ni generación de código fiable.
- Entrenado únicamente en inglés y sobre OpenWebText, un corpus de texto web con los sesgos propios de esa fuente (sesgo de dominio, registro y demografía).
- Riesgo de alucinación no cuantificado; con perplejidad de validación en torno a 54 sobre bloques de 512, la calidad de generación es propia de un modelo pequeño de laboratorio.
- No se documentan parámetros totales, longitud de contexto máxima, tipos de cuantización ni formatos alternativos de pesos, lo que dificulta planificar el despliegue.
- Al no ser transformer ni usar atención, es incompatible con los motores de inferencia estándar (vLLM, llama.cpp, TGI) sin trabajo de adaptación.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el estado experimental del modelo desaconseja cualquier uso comercial real.
- Los resultados de benchmarks son declarados por el autor y marcados como no verificados; las conclusiones del estudio (sustitución de memoria) son una interpretación del autor, no un hecho establecido.
- Las diferencias de perplejidad reportadas (−1,1%, −0,9%, −1,6%) están dentro de la dispersión entre semillas según el propio autor, por lo que no deben leerse como mejoras significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Gemelo de segundo orden (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Primer orden sin pozos (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Segundo orden sin pozos (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante con 16 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante con 2 pozos, primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Par TinyStories de primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Par Python de primer orden: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (ladder OpenWebText): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
