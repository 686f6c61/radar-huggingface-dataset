# GRRNMAKER/Cozet

## Resumen

Cozet es un modelo de lenguaje presentado por el autor GRRNMAKER (GRRN Research / Cognitus Lab Research) como el primer modelo nativo de la arquitectura SYNAXIM (Symbiotic Native Axim Inference Machine), un diseno no-transformer que sustituye la autoatencion por una matriz de memoria asociativa persistente denominada Symbiotic Gate. Segun la model card, el modelo se entrena desde inicializacion aleatoria, sin conversion desde pesos transformer, y su mecanica de inferencia opera con memoria O(1) respecto a la longitud de secuencia, lo que en teoria permitiria contexto ilimitado sin cache KV.

La version publicada corresponde a la Fase 1 (validacion de arquitectura) con 130 millones de parametros, mientras que las configuraciones Medium (1,3B) y Large (7,2B) aparecen unicamente como fases planificadas sin pesos publicados. El repositorio de Hugging Face ocupa 626,8 GB, un tamano desproporcionado para un modelo de 130M parametros, lo que sugiere la presencia de artefactos adicionales (checkpoints, datos o binarios del motor de inferencia) no documentados en la model card.

La relevancia del proyecto es fundamentalmente experimental: propone una alternativa a la atencion cuadratica mediante actualizaciones de producto exterior con compuerta escalar. No obstante, la informacion publica es muy limitada, la licencia es propietaria y no se han divulgado resultados de benchmarks, por lo que cualquier evaluacion practica debe considerar estas carencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SYNAXIM (Symbiotic Native Axim Inference Machine), no-transformer con Symbiotic Gate |
| Parametros totales | 130M (Cozet-Small, Fase 1); 1,3B (Medium, Fase 2) y 7,2B (Large, Fase 3) planificados sin pesos publicados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se declara "contexto infinito" por memoria O(1), sin cifra verificable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Propietaria (Proprietary), todos los derechos reservados |
| Formato de pesos | SYNAXIM `.symb` (motor de inferencia propio en NumPy puro) |

## Arquitectura y entrenamiento

SYNAXIM reemplaza la atencion estandar `softmax(QK^T/sqrt(d))V` por una actualizacion de memoria asociativa: una compuerta escalar `gate = sigmoid(mean(Q*K))` que modula la actualizacion `M_new = gate*M + (1-gate)*outer(k,v)`, seguida de recuperacion mediante `output = q @ M_new`. La matriz M nunca crece en funcion de la secuencia, de modo que el coste de memoria es O(D^2) fijo (con D la dimension del modelo) y el coste computacional por token es O(1) respecto a la longitud de contexto. La configuracion Small emplea D=1024, 12 capas, 16 cabezas de atencion con 4 grupos GQA y dimension intermedia 4096.

El entrenamiento, segun la model card, parte de pesos inicializados aleatoriamente y se realiza sobre FineWeb-Edu y RedPajama utilizando truncated BPTT a traves de la cadena de matrices M. No se especifica el numero de tokens procesados, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF, DPO o ajuste supervisado. Tampoco se detalla la funcion de perdida ni el esquema de optimizacion. La model card no documenta innovaciones adicionales como decodificacion especulativa o atencion lineal hibrida.

## Capacidades

- Generacion de texto autoregresiva basica, segun la descripcion del autor.
- Razonamiento y codigo: no documentados ni verificados.
- Matematicas: no documentadas.
- Vision o audio: no soportados segun la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no especificadas.
- Modo "thinking": no disponible.
- Memoria persistente O(1) con contexto potencialmente ilimitado, como propiedad arquitectonica declarada (sin validacion publica).

## Casos de uso

- Investigacion en arquitecturas alternativas a la atencion: Cozet-Small sirve como banco de pruebas para medir si la actualizacion de memoria asociativa via producto exterior preserva capacidad de modelado frente a transformers de tamano comparable.
- Experimentos de contexto largo en laboratorio: la propiedad de memoria O(1) permite probar secuencias de longitud creciente sin crecimiento del estado, util para estudiar degradacion de recuperacion asociativa.
- Prototipado de motores de inferencia ligeros: el formato `.symb` y el motor en NumPy puro permiten desplegar el modelo en entornos sin dependencias de CUDA ni frameworks de deep learning, util para entornos educativos o embebidos.
- Reproduccion academica de la teoria "Odyssey Meta-Cognitive Framework": el modelo puede emplearse para validar o refutar las afirmaciones teoricas del autor en publicaciones o tesis.
- Evaluacion comparativa de eficiencia memoria/calidad: util para investigadores que comparan curvas de perplejidad frente a transformers de 130M con contexto equivalente.
- Docencia sobre mecanismos de atencion: el codigo del motor NumPy permite ilustrar paso a paso como se actualiza una matriz de memoria asociativa, algo inviable con implementaciones optimizadas de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Por tamano (130M parametros), en FP16 requeriria aproximadamente 260 MB de pesos; en FP32, unos 520 MB, sin contar estados intermedios ni la matriz M (D^2 = 1024^2 floats, aproximadamente 4 MB en FP32 por capa).
- GPU recomendadas: no especificadas. El motor de inferencia declarado es NumPy puro, por lo que puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano, aunque no hay confirmacion oficial ni requisitos publicados.
- Opciones de despliegue: exclusivamente el motor SYNAXIM `.symb` del autor; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Nota: el repositorio de 626,8 GB excede con mucho el peso teorico del modelo y puede requerir almacenamiento considerable para su descarga completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cozet-Small | 130M | no disponible (declarado ilimitado) | SYNAXIM (no-transformer) | Propietaria | Pesos en HF, motor propio |
| GPT-2 Small | 124M | 1024 tokens | Transformer decoder | MIT | Amplia, multiples formatos |
| Pythia-160M | 160M | 2048 tokens | Transformer decoder | Apache 2.0 | Amplia, safetensors |
| GPT-Neo-125M | 125M | 2048 tokens | Transformer decoder | MIT | Amplia, safetensors |

La comparacion se limita a tamano de parametros, ya que Cozet no publica resultados de evaluacion que permitan contrastar calidad, y su licencia propietaria y formato propietario restringen su uso frente a las alternativas de codigo abierto.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia verificable de calidad, perplejidad ni capacidades reales.
- Licencia propietaria con "todos los derechos reservados": prohibe implicitamente el uso comercial sin autorizacion expresa del autor.
- Model card con afirmaciones no verificadas ("contexto infinito", "O(1) memory") que no van acompanadas de mediciones ni de codigo de evaluacion publicado.
- Fase 1 de validacion de arquitectura: el modelo no esta pensado para produccion y su calidad como asistente general es altamente dudosa.
- Riesgo elevado de alucinacion y de generacion incoherente en un modelo de 130M entrenado con un esquema no convencional y sin ajuste por instrucciones documentado.
- Idiomas soportados no especificados; probablemente limitado al ingles de los corpus FineWeb-Edu y RedPajama.
- Ecosistema cerrado: sin soporte en frameworks estandar, lo que dificulta integracion, cuantizacion y despliegue en infraestructura existente.
- Tamano del repositorio (626,8 GB) desproporcionado respecto al modelo, con posible contenido no documentado.
- Sin informacion sobre sesgos, filtrado de datos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GRRNMAKER/Cozet
- Repositorio de arquitectura SYNAXIM: https://github.com/GRRN-MAKER/SYNAXIM
- Perfil del autor en Hugging Face: https://huggingface.co/GRRNMAKER/datasets
- Perfil del autor en GitHub: https://github.com/grrnmaker
