# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob es un modelo de lenguaje experimental de 384 dimensiones de estado oculto, desarrollado por el autor independiente dimitarpg13 dentro de la familia "Semantic Simulation". No es un transformer ni usa atencion: es un modelo de lenguaje conservativo basado en un potencial escalar y en mecanica lagrangiana, entrenado como un flujo de gradiente de primer orden verdadero (sin velocidad ni inercia) sobre OpenWebText. Forma parte de un estudio pre-registrado de ablacion de mecanismos ("ladder study") que compara variantes de la misma arquitectura con presupuestos de tokens idénticos.

El modelo concreto incorpora dos pozos de modo de Poisson ("PM2") con 16 modos rígidos ("PMX16"), y su entrenamiento relaja exactamente el muelle congelado de los pozos y los modos rígidos. Su relevancia es puramente investigadora: sirve para responder si la dinamica de segundo orden (velocidad e inercia) aporta algo frente a un flujo de primer orden cuando se anaden pozos de potencial. El veredicto del autor es que, con dos pozos, el primer orden supera a su gemelo de segundo orden (53,81 frente a 54,71 de perplejidad) y empata con el mejor modelo conservativo de la familia usando una octava parte de los pozos.

El modelo se entrena con 532,48 millones de tokens (32.500 pasos × 32 × 512) y se evalua en perplejidad sobre la particion de validacion de OpenWebText con bloques de 512 tokens. El repositorio ocupa 0,3 GB, lo que sugiere un modelo de escala muy pequena, adecuado solo para experimentacion, no para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo no-transformer, sin atencion; potencial escalar con mecanica lagrangiana, flujo de gradiente de primer orden, 2 pozos de modo de Poisson y 16 modos rígidos (PM2-PMX16) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado y evaluado con bloques de 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | pesos PyTorch (libreria pytorch); no se especifica safetensors ni GGUF |
| Dimension de estado oculto | 384 (d384) |
| Numero de capas | 2 (l2) |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Dataset | Skylion007/openwebtext |
| Memoria de inferencia | constante (constant-memory-inference, segun tags) |

## Arquitectura y entrenamiento

La arquitectura se aparta por completo del transformer: no hay atencion ni mecanismo de query-key-value. El modelo se formula como un sistema fisico conservativo con un potencial escalar, resuelto mediante mecanica lagrangiana y geometria riemanniana (geodesicas riemannianas con metrica de Jacobi). En esta variante concreta, el entrenamiento se realiza como un flujo de gradiente de primer orden verdadero: el muelle congelado de los pozos y los modos rígidos se relajan de forma exacta y no existe variable de velocidad en ningun punto del modelo. Los tags indican el uso de integradores tipo BAOAB y "cfc", asi como un espacio de Fock para los modos de Poisson.

El entrenamiento usa exactamente 532.480.000 tokens de OpenWebText, con el mismo calendario y presupuesto que el resto de la escalera Gen 3. El modelo gemelo de segundo orden y este comparten semilla (seed 0) y ven los mismos lotes de entrenamiento y evaluacion, de modo que las diferencias se miden de forma emparejada (correlacion de 0,999 entre cambios de evaluacion paso a paso). El estudio esta pre-registrado (MS2a) y el objetivo declarado es aislar el efecto de la dinamica de segundo orden frente a la de primer orden con pozos de potencial anadidos. No se documentan fases de RLHF ni DPO; el entrenamiento es de modelado de lenguaje autoregresivo puro.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad medida unicamente por perplejidad sobre OpenWebText.
- Modelado de lenguaje sin atencion, con memoria de inferencia constante segun los tags del modelo.
- Capacidad de investigacion reproducible: pares emparejados por paso y semilla para comparar mecanismos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; solo ingles.
- No se documenta modo "thinking", vision ni audio.
- No se documentan capacidades de codigo o matematicas mas alla de la variante hermana entrenada en Python (no este checkpoint).

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como punto de comparacion controlado para estudiar si la atencion es imprescindible en modelado de lenguaje a pequena escala, gracias a su presupuesto de tokens fijo y reproducible.
- Ablacion de mecanismos pre-registrada: util para replicar el estudio de primer orden frente a segundo orden con pozos de Poisson, ya que comparte lotes y semilla con su gemelo.
- Estudio de modelos conservativos y energy-based: permite analizar el comportamiento de un potencial escalar con dos pozos y 16 modos rígidos en una tarea de lenguaje real (OpenWebText).
- Experimentos de inferencia con memoria constante: el tag constant-memory-inference sugiere su uso en escenarios donde el coste de memoria no debe crecer con la longitud de secuencia, aunque no hay datos de latencia publicados.
- Docencia y divulgacion: ejemplo concreto de modelo de lenguaje no-transformer con formulacion fisica, util para explicar mecanica lagrangiana aplicada a IA.
- Reproduccion de resultados de perplejidad: sirve para verificar el valor 53,81 en validacion de OpenWebText con bloques de 512 y comparar con las otras variantes de la escalera.
- No es adecuado para atencion al cliente, generacion de codigo en produccion ni pipelines de agentes: no hay evidencia de calidad generativa, tool calling ni multilingue.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| text-generation | OpenWebText (validation) | Perplejidad a bloque 512, asentada (media de las tres ultimas evaluaciones de 500 pasos) | 53,81 |

Comparacion dentro de la escalera Gen 3 (perplejidad, mismo presupuesto de 532,5M tokens en OpenWebText):

| Par | Segundo orden | Primer orden (este modelo) | Diferencia |
|---|---:|---:|---:|
| Sin pozos (OWT) | 58,32 | 61,16 | +4,9% |
| 64 pozos (PMX) | 54,63 | 54,02 | −1,1% |
| 16 pozos (PMX-K16) | 54,24 | 53,73 | −0,9% |
| 2 pozos (PM2-PMX16) | 54,71 | 53,81 | −1,6% |

El autor indica que la mejor perplejidad observada fue 51,90 en el paso 31.000, y que la media de las tres ultimas evaluaciones fue 53,77, 53,90 y 53,76.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,3 GB, lo que sugiere que el modelo cabe holgadamente en cualquier GPU consumer, pero no se publican cifras de parametros ni de VRAM.
- GPU recomendadas: no disponible. Por el tamano del repositorio, cualquier GPU con al menos unos pocos GB de memoria deberia bastar, pero es una inferencia, no un dato del autor.
- GPU consumer: probablemente si (repositorio de 0,3 GB), sin confirmacion oficial.
- Opciones de despliegue: la libreria declarada es PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI. Al no ser un transformer, es improbable que funcione en runtimes estandar sin codigo especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad OWT (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FO-b-PM2-PMX16) | no disponible (d384, l2) | no disponible | 53,81 | cc-by-4.0 | Hugging Face |
| semsimula PM2-PMX16 SR2 (gemelo de segundo orden) | no disponible (d384, l2) | no disponible | 54,71 | cc-by-4.0 | Hugging Face |
| semsimula FO-b-PMX-K16 (16 pozos) | no disponible (d384, l2) | no disponible | 53,73 | cc-by-4.0 | Hugging Face |
| semsimula FO-b-OWT (sin pozos) | no disponible (d384, l2) | no disponible | 61,16 | cc-by-4.0 | Hugging Face |

No se dispone de comparacion con transformers convencionales del mismo tamano en la informacion proporcionada; los unicos datos comparables son las variantes de la propia familia.

## Limitaciones y advertencias

- Modelo exclusivamente de investigacion: no hay evidencia de calidad generativa mas alla de la perplejidad; no se han publicado evaluaciones en tareas downstream.
- Solo ingles; no se documenta soporte multilingue.
- Contexto de entrenamiento y evaluacion limitado a bloques de 512 tokens; no se declara una ventana de contexto mayor.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor; al entrenarse en OpenWebText, hereda los sesgos de ese corpus.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero el modelo no esta pensado ni validado para produccion.
- Arquitectura no-transformer sin soporte documentado en runtimes de inferencia estandar (vLLM, llama.cpp, TGI); requiere codigo propio.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente (verified: false).
- El numero de parametros no se publica, lo que dificulta estimar costes de despliegue.
- El estudio es pre-registrado y de un solo autor; conviene tratarlo como evidencia preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden (PM2-PMX16 SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm2-pmx16-sr2
- Mejor modelo conservativo de la familia (FO-b-PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- Variante de 16 pozos de segundo orden (PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Variante de 64 pozos de segundo orden (PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- Variante de 64 pozos de primer orden (FO-b-PMX): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2-fob
- Variante sin pozos de segundo orden (SR2): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- Variante sin pozos de primer orden (FO-b-OWT): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Variante TinyStories de segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Variante TinyStories de primer orden (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Variante TinyStories de primer orden verdadero (FO-b-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Variante TinyStories con 2 pozos, segundo orden (PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Variante TinyStories con 2 pozos, primer orden (FO-b-PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Variante de codigo Python, segundo orden (SO-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Variante de codigo Python, primer orden (FO-b-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Variante de codigo Python con 2 pozos, segundo orden (PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2
- Variante de codigo Python con 2 pozos, primer orden (FO-b-PM2-CODE): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Coleccion primer orden frente a segundo orden (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Coleccion Gen 3 (CFC, BAOAB, gradientes en vivo): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Dataset OpenWebText: https://huggingface.co/datasets/Skylion007/openwebtext
