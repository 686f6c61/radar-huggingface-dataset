# Avicennasis/K2-Horizon-3.7B-heretic-mlx-8bit

## Resumen

K2-Horizon-3.7B-heretic-mlx-8bit es una conversion a 8 bits del modelo abliterado K2-Horizon-3.7B-heretic, publicada por el usuario Avicennasis. Se distribuye en formato MLX, la libreria de arrays y redes neuronales de Apple orientada a ejecucion local sobre silicio de la compania (series M). El repositorio pesa 5,4 GB y los pesos declarados en safetensors suman 5.058.255.360 parametros, una cifra que no coincide con el "3.7B" del nombre del modelo, posiblemente porque el conteo incluye componentes adicionales o porque la etiqueta del nombre es orientativa.

El modelo base pertenece a una familia poco documentada en la informacion disponible. La model card indica que la arquitectura es `k2_horizon` y que `mlx-lm` todavia no la soporta de forma nativa, por lo que el repositorio incluye su propio modulo de arquitectura (`k2_horizon.py`, un port a MLX del `modeling_k2_horizon.py` de IFM) que se carga mediante `model_file` y `trust_remote_code=True`. Esto implica que el usuario debe confiar en codigo remoto para poder ejecutar el modelo.

La relevancia de esta ficha es acotada: se trata de una cuantizacion de conveniencia para usuarios de Mac que quieran ejecutar localmente una variante "abliterated" (con las conductas de rechazo eliminadas) de un modelo bilingue ingles-chino de ~5B parametros. No hay resultados de benchmarks publicados, ni datos de entrenamiento, ni longitud de contexto documentada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `k2_horizon` (requiere modulo de arquitectura propio y `custom_code`); detalles internos no disponibles |
| Parametros totales | 5.058.255.360 (segun safetensors); el nombre del repositorio indica 3,7B |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine con group size 64 (MLX); el modelo base puede existir en otros formatos, no especificados |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla del identificador `k2_horizon`. Lo unico confirmado es que la implementacion distribuida en este repositorio es un port a MLX del modulo `modeling_k2_horizon.py` de IFM, con licencia MIT, y que es el mismo modulo que emplean los checkpoints de K2-Horizon publicados por la organizacion `mlx-community`. No hay informacion sobre si se trata de un transformer denso, un MoE, un modelo hibrido ni sobre mecanicas de atencion concretas.

Tampoco se documentan datos de entrenamiento: no se indica el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otra forma de alineamiento. La unica intervencion declarada sobre el modelo base es la abliteracion, una tecnica que elimina la direccion latente asociada al rechazo para suprimir el comportamiento de negativa. El autor advierte explicitamente de que la abliteracion elimina la *conducta* de rechazo y no afirma que el entrenamiento de seguridad haya sido revertido. La cuantizacion a 8 bits es de tipo affine con group size 64.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Soporte bilingue limitado a ingles (`en`) y chino (`zh`); no se declaran otros idiomas.
- Comportamiento sin rechazos: la abliteracion elimina las negativas del modelo base, lo que en la practica amplia el rango de peticiones que el modelo respondera.
- Ejecucion local sobre Apple Silicon mediante `mlx-lm`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explicito (*thinking*), vision, audio ni otras modalidades.
- No se documentan capacidades de agente o razonamiento multi-paso mas alla de lo que permita la generacion autoregresiva estandar.
- Ejemplo de uso verificado en la model card: aritmetica simple (calculo de 17 x 23) mediante plantilla de chat.

## Casos de uso

- Prototipado local en Mac: un desarrollador con un equipo Apple Silicon puede cargar el modelo con `mlx_lm.load(..., trust_remote_code=True)` y probar prompts conversacionales sin depender de APIs externas ni de conectividad.
- Traduccion y asistencia bilingue ingles-chino: el modelo declara ambos idiomas, por lo que resulta util para tareas de redaccion, reescritura o resumen entre esos dos idiomas en entornos locales.
- Generacion de texto creativo sin filtros editoriales: al tratarse de una variante abliterated, encaja en flujos de escritura de ficcion o guiones donde los rechazos automatizados interrumpen la tarea.
- Experimentacion academica sobre abliteration: permite estudiar de forma practica como la supresion de la direccion de rechazo afecta a la calidad, la coherencia y la seguridad de las respuestas en un modelo de ~5B.
- Evaluacion comparativa de cuantizacion: sirve para medir la degradacion entre el modelo base en precision completa y esta conversion a 8 bits en tareas de generacion y aritmetica.
- Integracion en demos y cuadernos reproducibles: el repositorio incluye un ejemplo minimo funcional con `apply_chat_template` y `generate`, lo que facilita montar demos en Jupyter o en un script de linea de comandos.
- Base para pipelines de inferencia offline: al pesar 5,4 GB, puede mantenerse residente en un portatil Apple Silicon para tareas de asistencia de texto sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un ejemplo de uso con el prompt "What is 17 times 23?" sin reportar exactitud, latencia ni ninguna otra metrica.

## Requisitos de hardware

- Peso de los pesos: el repositorio ocupa 5,4 GB, coherente con una cuantizacion a 8 bits de 5.058.255.360 parametros (aproximadamente 1 byte por parametro mas metadatos).
- Plataforma nativa: MLX esta disenado para Apple Silicon, por lo que el despliegue directo de este checkpoint se orienta a chips de la serie M (M1, M2, M3, M4 y variantes Pro, Max y Ultra).
- Memoria unificada recomendada: al menos 8 GB libres para la carga del modelo; 16 GB o mas para trabajar comodamente con contextos largos y otras aplicaciones abiertas. En equipos con 8 GB totales el modelo dejara muy poco margen al sistema.
- GPU NVIDIA y AMD: no es la ruta nativa de MLX; para usar este modelo en CUDA seria necesaria una conversion a otro formato (por ejemplo GGUF o safetensors de PyTorch), no documentada en el repositorio.
- Opciones de despliegue: `mlx-lm` con `trust_remote_code=True` y carga del modulo de arquitectura incluido (`model_file`). No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni MLX LM Server.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo en ningun hardware concreto.

## Comparativa con modelos similares

Solo se dispone de datos del modelo base y de referencias genericas a los checkpoints de `mlx-community`, sin especificaciones publicadas en la informacion proporcionada. La comparativa se limita por tanto a lo verificable.

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato | Datos disponibles |
|---|---|---|---|---|---|---|
| Avicennasis/K2-Horizon-3.7B-heretic-mlx-8bit | 5.058.255.360 (segun safetensors) | 8 bits affine, group size 64 | no disponible | apache-2.0 | safetensors (MLX) | Model card minima, sin benchmarks |
| Avicennasis/K2-Horizon-3.7B-heretic (base) | no disponible | precision completa u otras | no disponible | apache-2.0 | no disponible | No consultado en detalle en esta busqueda |
| Checkpoints de `mlx-community` para K2-Horizon | no disponible | no disponible | no disponible | no disponible | MLX | Mencionados en la model card, sin datos |

No se dispone de informacion suficiente para comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo abliterated: las conductas de rechazo han sido eliminadas, por lo que puede generar contenido que el modelo original rechazaria. El autor advierte de que esto no implica que el entrenamiento de seguridad haya sido revertido; el riesgo de uso indebido recae en quien despliega el modelo.
- Ejecucion de codigo remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python distribuido en el repositorio. Solo deberia hacerse tras auditar `k2_horizon.py`.
- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, lo que impide estimar la calidad real frente al modelo base.
- Discrepancia en el numero de parametros: el nombre indica 3,7B pero safetensors declara 5.058.255.360. Conviene verificar la arquitectura antes de planificar requisitos de memoria.
- Idiomas restringidos: solo se declaran ingles y chino. No hay garantia de un comportamiento correcto en castellano u otros idiomas, aunque el modelo pueda producir texto en ellos.
- Longitud de contexto desconocida: no se puede dimensionar el uso en tareas que requieran ventanas largas (documentos extensos, historiales de conversacion prolongados) sin una medicion propia.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni mecanismos de mitigacion; es esperable un comportamiento similar al de otros modelos densos de su tamano.
- Trazabilidad del entrenamiento nula: se desconoce el dataset, el numero de tokens y las fases de alineamiento del modelo base, lo que dificulta evaluar sesgos.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero la licencia del modelo base y del modulo de arquitectura portado (MIT) debe respetarse de forma independiente. El autor indica que la licencia Apache-2.0 proviene del modelo base.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes", sin senales de validacion por parte de la comunidad.
- Fecha de publicacion atipica (2026-10-03) en los metadatos; conviene verificar la vigencia del repositorio antes de integrarlo en un flujo de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic-mlx-8bit
- Modelo base: https://huggingface.co/Avicennasis/K2-Horizon-3.7B-heretic
- Issue de mlx-lm sobre la arquitectura k2_horizon: https://github.com/ml-explore/mlx-lm/issues/1876
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a documentacion de Google Drive y no guardan relacion con el contenido de esta ficha.
