# dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential

## Resumen

`semsimula-ladder-live-owt-d384-l2-attention-potential` es un modelo de lenguaje de investigación desarrollado por el usuario independiente dimitarpg13 dentro del programa "SemSimula", una línea de trabajo que explora modelos de lenguaje basados en principios físicos (mecánica lagrangiana, campos de potencial escalar y modelos basados en energía) en lugar de la atención estándar de los transformers. Este ejemplar concreto pertenece a la "Generación 3" del estudio y es el brazo `attention_potential` con L=2: incorpora un campo de intercambio conservativo (una interacción de tipo atención formulada como potencial) sobre un modelo base sin intercambio, con todas las rutas de gradiente activas durante el entrenamiento.

El modelo tiene 77,4 M de parámetros, se entrena sobre OpenWebText con un presupuesto fijo de 532.480.000 tokens y emplea una arquitectura no-transformer y libre de atención (attention-free) denominada Fock-PARFLM, con registros virtuales y un "canal inverso". Su relevancia es fundamentalmente metodológica: forma parte de un estudio de ablación pre-registrado que compara brazos con presupuesto de tokens idéntico, lo que permite aislar el efecto de mecanismos concretos (campo de intercambio, convención de gradientes, enrutamiento) frente a un GPT-2 emparejado.

El resultado principal es negativo y honesto: el campo de intercambio conservativo, tal como se entrena aquí, no aporta mejora medible (el modelo es un 2,1 % peor que su gemelo sin campo). La contribución real es la mejora del 33 % en perplejidad respecto a su gemelo de Generación 2, atribuible únicamente al cambio en la convención de gradientes. Es, por tanto, un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM (no-transformer, attention-free, modelo basado en energía con campo de potencial escalar y campo de intercambio conservativo) |
| Parametros totales | 77,4 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería `pytorch`); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura Fock-PARFLM se describe en la model card como un modelo de lenguaje conservativo basado en un potencial escalar, inspirado en la mecánica lagrangiana y en los modelos basados en energía. No utiliza atención en el sentido convencional: la interacción entre tokens se formula como un campo de intercambio conservativo (la fuerza es el gradiente de un potencial), complementado con "registros virtuales" y un "canal inverso". El modelo pertenece a la familia PARFLM con espacio de Fock y se etiqueta explícitamente como no-transformer y attention-free. La variante aquí descrita tiene L=2 y añade el campo de intercambio conservativo sobre el modelo base sin intercambio, manteniendo exactamente el mismo forward que su gemelo de Generación 2.

El entrenamiento usa OpenWebText con un presupuesto fijo y comparable entre todos los brazos del estudio: 32.500 pasos × 32 de batch × 512 tokens = 532.480.000 tokens, con el mismo corpus, tokenizador y lotes de validación que el resto de brazos de Gen 2 y el GPT-2 emparejado. La innovación de esta Generación 3 es que todas las rutas de gradiente relevantes (`relax_grad_path`, `vphi_grad_path`, `xi_grad_path`) están "vivas": el gradiente de la pérdida llega a los tokens anteriores a través de Vφ, de ξ y de las fuentes y el enrutamiento del campo de intercambio, mientras que en Gen 2 esas tres rutas estaban desconectadas (detached). La model card indica que el entrenamiento se realizó en una única sesión de Colab, a 1,68 s/paso, sin activaciones del watchdog ni picos, con un 1,4 % de pasos con clipping (9 de 650 registrados, norma máxima 1,14, entre los pasos 20.000 y 27.500).

## Capacidades

- Generación de texto autoregresiva en inglés, con decodificación a nivel de token sobre un vocabulario derivado de OpenWebText.
- Modelado de lenguaje y estimación de probabilidad (perplejidad) sobre texto en inglés.
- Razonamiento de corto alcance dentro de la ventana de 512 tokens usada en entrenamiento; no hay evidencia de capacidades de razonamiento de largo alcance.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe: únicamente inglés; no hay evidencia de transferencia a otros idiomas.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Su valor práctico es como objeto de estudio: permite reproducir y auditar un experimento de ablación de mecanismos con presupuesto de tokens controlado.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: sirve como punto de partida reproducible para estudiar modelos basados en energía y campos de potencial conservativos, ya que el código y la configuración del experimento están asociados al repositorio del autor.
- Ablación controlada de mecanismos: al compartir corpus, tokenizador, presupuesto de tokens y lotes de validación con otros brazos del estudio, permite aislar el efecto de un mecanismo concreto (aquí, el campo de intercambio) frente a un GPT-2 emparejado.
- Estudio de convenciones de gradiente: el modelo documenta una mejora del 33 % en perplejidad atribuible solo a hacer "vivas" las rutas de gradiente, lo que lo convierte en un caso de estudio útil sobre cómo la propagación de gradientes afecta al entrenamiento de modelos con rutas intermedias.
- Reproducción de experimentos pre-registrados: la model card incluye la predicción pre-registrada (punto 51, banda 46–56) y el resultado real (54,21, dentro de la banda), lo que facilita la verificación independiente de la metodología.
- Docencia y formación: como ejemplo didáctico de modelado de lenguaje a pequeña escala (77 M de parámetros) con un presupuesto de cómputo modesto (una sesión de Colab), es adecuado para ilustrar el ciclo completo de entrenamiento y evaluación.
- Evaluación de perplejidad comparada: puede usarse como referencia en estudios que comparen perplejidad en OpenWebText con arquitecturas no-transformer de tamaño similar, siempre que se respete el mismo protocolo de evaluación (bloque de 512, media de las tres últimas evaluaciones de 500 pasos).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Todos los modelos comparten presupuesto de 532.480.000 tokens.

| Modelo | Perplejidad (validación, bloque 512, asentada) | Parámetros | Relación vs GPT-2 |
|---|---:|---:|---:|
| Este modelo (L=2, attention_potential, Gen 3) | 54,21 | 77,4 M | 1,088× |
| Sin intercambio, Fock activo, L=4 (Gen 3) | 50,10 | 76,8 M | 1,006× |
| Sin intercambio, Fock activo, L=2 (Gen 3) | 53,12 | 76,8 M | 1,066× |
| Solo conservativo, sin canal inverso (Gen 3, L=2) | 57,76 | 76,6 M | 1,160× |
| attention_potential con enrutamiento endurecido (Gen 3, L=2) | 52,90 | 77,4 M | 1,062× |
| attention_potential, solo campo de intercambio vivo (Gen 2, L=2) | 61,11 | 77,4 M | 1,227× |
| Brazo attention (Gen 2, L=2) | 63,51 | 77,4 M | 1,275× |
| attention_potential con todo detached (Gen 2, L=2) | 80,90 | 77,4 M | 1,624× |
| GPT-2 emparejado (L=8) | 49,81 | 33,7 M | 1,000× |

Detalles adicionales aportados por el autor: la perplejidad asentada es la media de las tres últimas evaluaciones (54,17; 54,35; 54,12), con mejor valor 52,44 en el paso 31.000 y valor final 54,12. En el paso 3.000 el modelo registraba 118,14 frente a 133,74 de su sonda padre (−11,7 %) y 123,59 del modelo L=2 sin intercambio con gradientes vivos. La predicción pre-registrada (punto 51, banda 46–56) se cumplió, pero la línea clave (superar en más del 2 % al modelo L=2 sin intercambio, es decir, ~52,1 o menos) no se cumplió: el modelo es un 2,1 % peor. La métrica ω·dt mediana quedó en 2,07, fuera de la banda esperada [3,3; 4,2].

## Requisitos de hardware

- VRAM estimada para inferencia: con 77,4 M de parámetros, en fp32 ocupa aproximadamente 0,31 GB de pesos; en fp16 unos 0,15 GB. El repositorio completo pesa 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el autor entrenó en una sesión de Colab (GPU consumer de gama media), lo que da una idea del perfil de cómputo.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia de baja carga.
- Opciones de despliegue: al ser un modelo PyTorch con arquitectura personalizada (no-transformer, attention-free), no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; requiere cargar el código del autor (`model_parf_multixi.py` y dependencias del proyecto) en PyTorch.
- Latencia y throughput: el autor reporta 1,68 s/paso durante el entrenamiento en Colab; no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (OpenWebText) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Este modelo (Gen 3, L=2) | 77,4 M | 512 (entrenamiento) | 54,21 | CC-BY-4.0 | Hugging Face |
| Sin intercambio, Fock activo, L=2 (Gen 3) | 76,8 M | 512 (entrenamiento) | 53,12 | CC-BY-4.0 | Hugging Face |
| attention_potential con enrutamiento endurecido (Gen 3, L=2) | 77,4 M | 512 (entrenamiento) | 52,90 | CC-BY-4.0 | Hugging Face |
| GPT-2 emparejado (L=8) | 33,7 M | 512 (entrenamiento) | 49,81 | no disponible en la información | Hugging Face (brazo del estudio) |

La comparación con GPT-2 estándar (124 M) no se ha publicado en la información disponible; el único GPT-2 de referencia es el emparejado por presupuesto de tokens del propio estudio, con 33,7 M de parámetros.

## Limitaciones y advertencias

- El campo de intercambio conservativo no aporta mejora medible: el modelo es un 2,1 % peor que su gemelo sin campo, y la versión con enrutamiento endurecido solo mejora un 0,4 % (dentro del ruido de evaluación).
- El precio de la conservatividad no se ha medido: requiere reentrenar el brazo `attention` no conservativo con gradientes vivos.
- El modelo es un artefacto de investigación: no está pensado ni validado para uso en producción, y su arquitectura personalizada no es compatible con los runtimes de inferencia habituales.
- Entrenado únicamente en inglés y sobre OpenWebText, un corpus de texto web con sesgos conocidos (tópicos, registro, demografía de los enlaces); se esperan sesgos heredados del corpus.
- Riesgo de alucinación alto por tamaño (77 M) y por el dominio de entrenamiento; no se han publicado evaluaciones de factualidad.
- Ventana de contexto de 512 tokens en entrenamiento; no se documenta capacidad de extrapolación a contextos mayores.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el modelo no ofrece garantías de calidad para tales fines.
- Los resultados de perplejidad son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model-index).
- El entrenamiento se realizó en una sola sesión de Colab; no se documenta reproducibilidad multi-semilla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential
- Colección Generación 3 (live gradients): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Gemelo Gen 2 (attention_potential): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Sonda padre (Gen 2, solo campo de intercambio vivo): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential-rglive
- Brazo attention (Gen 2): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Modelo sin intercambio, L=2 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none
- Modelo sin intercambio, L=4 (Gen 3): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l4-none
- Solo conservativo, sin canal inverso (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc
- attention_potential con enrutamiento endurecido (Gen 3, L=2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-attention-potential-rfqk
- GPT-2 emparejado (L=8): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
