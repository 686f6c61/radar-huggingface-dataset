# Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B

## Resumen
Privoid AIDetect 0.8B es un detector de texto generado por IA construido como un adaptador LoRA (PEFT) sobre el modelo base Qwen3.5-0.8B, desarrollado por Privoid-ai. El modelo recibe un fragmento de texto y devuelve una puntuacion continua entre 0 y 1 que indica la probabilidad de que el texto haya sido escrito por un modelo de lenguaje, incluyendo casos en los que el texto ha sido parafraseado o manipulado con tecnicas adversariales.

El modelo aborda uno de los problemas practicos mas dificiles de la deteccion de texto sintetico: la generalizacion a dominios y modelos no vistos durante el entrenamiento. Para ello se entrena sobre los conjuntos MAGE y RAID, e incorpora en su evaluacion escenarios de parafraseo con GPT-4 y once ataques adversariales de RAID. Con solo 0,8 mil millones de parametros, se posiciona como una alternativa ligera frente a detectores basados en RoBERTa o modelos de mayor tamano.

Su relevancia actual radica en el equilibrio entre tamano reducido, licencia Apache 2.0 y robustez declarada frente a texto de GPT-4 y dominios fuera de distribucion. La publicacion de pesos GGUF para uso offline facilita su integracion en pipelines de moderacion de contenido, verificacion academica y control de autenticidad editorial sin depender de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-0.8B) con adaptador LoRA (PEFT) para clasificacion |
| Parametros totales | 0,8 mil millones (modelo base); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B; la model card trunca la entrada a 2000 caracteres) |
| Tipos de cuantizacion | GGUF disponible en el repositorio Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B-GGUF (niveles no especificados) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); GGUF en repositorio separado |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, sobre el que se aplica un adaptador LoRA entrenado con la libreria Unsloth. La tarea se formula como clasificacion binaria mediante el prompting del modelo base: se le instruye con un mensaje de sistema para que responda exactamente "ai" o "human", y la puntuacion de deteccion se deriva de la probabilidad asignada al token "ai". La entrada se trunca a los primeros 2000 caracteres del texto analizado.

El entrenamiento utiliza los conjuntos de datos MAGE y RAID, con eliminacion de los textos de test para evitar filtraciones. La model card indica que se cubren dominios multiples, texto generado por GPT-4, parafraseo y once ataques adversariales de RAID. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un adaptador de clasificacion, lo habitual seria un ajuste supervisado, pero este dato no esta confirmado.

## Capacidades
- Deteccion de texto generado por IA con salida de puntuacion continua entre 0 y 1.
- Clasificacion binaria "ai" o "human" mediante generacion restringida a un unico token.
- Robustez declarada frente a texto parafraseado, incluido parafraseo con GPT-4.
- Generalizacion a dominios no vistos, evaluada sobre subconjuntos fuera de distribucion de MAGE y RAID.
- Resistencia a ataques adversariales de RAID (once ataques evaluados).
- Deteccion de texto de multiples generadores, incluidos modelos de la familia GPT.
- Uso offline mediante pesos GGUF.
- No soporta tool calling, agentes, vision ni audio: es un clasificador de texto especializado.
- Capacidad multilingue limitada al ingles.

## Casos de uso
- Moderacion de contenido en plataformas: puntuar automaticamente articulos, comentarios o resenas para senalar posible texto generado por IA antes de la revision humana, aprovechando el bajo coste de un modelo de 0,8B.
- Integridad academica: analizar entregas y trabajos de estudiantes para detectar texto sintetico, con la puntuacion como indicio preliminar que el docente contrasta manualmente.
- Verificacion editorial: filtrar contribuciones externas en medios digitales y detectar contenido generado automaticamente antes de su publicacion.
- Deteccion de resenas falsas en comercio electronico: procesar lotes de resenas y priorizar las de mayor puntuacion de IA para investigacion antifraude.
- Analisis de corpus de investigacion: etiquetar grandes volumenes de texto recopilado de la web para estimar la proporcion de contenido sintetico en un dataset antes de usarlo en entrenamiento.
- Control de calidad en generacion de contenido: verificar que textos etiquetados como humanos en un pipeline de datos no hayan sido producidos por modelos, como paso de validacion previo a la anotacion.
- Despliegue en entornos con recursos limitados: ejecucion local mediante GGUF en equipos sin GPU dedicada para auditorias de texto offline y con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (metrica AUROC; 50 equivale a azar). Los valores de los modelos comparados provienen de la model card y no han sido verificados de forma independiente.

| Test set | Textos | Qwen3.5-0.8B (base) | OpenAI RoBERTa-large | Mozilla Fakespot RoBERTa | desklib v1.01 | Privoid AIDetect 0.8B |
|---|---|---|---|---|---|---|
| MAGE test (in-domain) | 6.000 | 51,6 | 76,8 | 76,8 | 92,8 | 97,9 |
| MAGE unseen domains + GPT-4 | 1.562 | 32,4 | 64,0 | 96,4 | 98,6 | 97,5 |
| MAGE paraphrased (GPT-4) | 2.362 | 43,4 | 70,8 | 86,3 | 86,2 | 84,3 |
| RAID held-out docs (con ataques) | 6.000 | 46,5 | 71,8 | 94,7 | 95,2 | 98,9 |
| RAID extra domains (unseen) | 6.000 | 50,6 | 63,5 | 83,3 | 82,5 | 89,8 |

Resumen agregado declarado por el autor:

| Modelo | Parametros (B) | AUROC medio (5 sets) | AUROC medio (3 sets no vistos) | % de texto IA detectado con 5% de falsos positivos |
|---|---|---|---|---|
| Privoid AIDetect 0.8B | 0,8 | 93,7 | 90,5 | 68,7 |
| desklib AI detector v1.01 | 0,43 | 91,1 | 89,1 | 64,3 |
| Mozilla Fakespot RoBERTa | 0,13 | 87,5 | 88,7 | 60,8 |
| OpenAI RoBERTa-large detector | 0,36 | 69,4 | 66,1 | 20,4 |
| Qwen3.5-0.8B (base) | 0,8 | 44,9 | 42,1 | 3,4 |

Nota del autor: los resultados de RAID provienen de documentos de entrenamiento retenidos, no del test oculto oficial de RAID, por lo que no son cifras de leaderboard. Mozilla Fakespot y desklib fueron entrenados con RAID, de modo que su rendimiento en RAID held-out no constituye una prueba limpia.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 1,6-2 GB solo para pesos del modelo base, mas overhead de activaciones y del adaptador; en la practica, alrededor de 3-4 GB con el runtime de PyTorch.
- Cuantizacion GGUF: permite ejecucion en CPU con requisitos de memoria del orden de 0,5-1 GB segun el nivel de cuantizacion (niveles no especificados en la informacion disponible).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060); tambien cabe en GPUs de datacenter (A100, H100) para despliegues de alto throughput por lotes.
- Cabe en GPU consumer: si, en practicamente toda la gama actual, incluida la mayoria de iGPU con suficiente memoria compartida en modo GGUF.
- Opciones de despliegue: transformers con PEFT (ruta oficial de la model card), llama.cpp u Ollama mediante los pesos GGUF, y batching con vLLM o TGI para el modelo base con el adaptador (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles. Por el tamano del modelo, se espera latencia de decenas de milisegundos por texto de hasta 2000 caracteres en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros (B) | Contexto | AUROC medio (5 sets) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid AIDetect 0.8B | 0,8 | no disponible | 93,7 | Apache 2.0 | HuggingFace (safetensors + GGUF) |
| desklib AI detector v1.01 | 0,43 | no disponible | 91,1 | no disponible | HuggingFace |
| Mozilla Fakespot RoBERTa | 0,13 | no disponible | 87,5 | no disponible | HuggingFace |
| OpenAI RoBERTa-large detector | 0,36 | no disponible | 69,4 | no disponible | HuggingFace |

Frente a los detectores basados en RoBERTa, Privoid AIDetect ofrece el mayor AUROC medio declarado a costa de un tamano mayor (0,8B frente a 0,13-0,43B). Su ventaja mas clara aparece en dominios no vistos y en texto con ataques adversariales de RAID; su punto debil relativo es el texto parafraseado con GPT-4, donde Mozilla Fakespot y desklib obtienen puntuaciones superiores (86,3 y 86,2 frente a 84,3). La licencia Apache 2.0 y la disponibilidad de GGUF facilitan su uso comercial y su despliegue offline frente a alternativas cuya licencia no esta detallada en la informacion disponible.

## Limitaciones y advertencias
- Solo soporta ingles; el rendimiento en otros idiomas no esta evaluado y probablemente sea deficiente.
- La entrada se trunca a 2000 caracteres, de modo que textos mas largos se evaluan solo parcialmente.
- El texto parafraseado con GPT-4 es el escenario mas debil declarado (AUROC 84,3), inferior a detectores mas pequenos como Mozilla Fakespot y desklib.
- Riesgo de falsos positivos sobre texto humano formal o altamente predecible; el punto de operacion declarado admite hasta un 5% de falsos positivos.
- El modelo se entreno con MAGE y RAID, por lo que los resultados en MAGE test son in-distribution y no deben interpretarse como generalizacion limpia.
- Los resultados de RAID no provienen del test oculto oficial y no son comparables con cifras de leaderboard.
- Los benchmarks estan declarados por el autor y no han sido verificados de forma independiente; el model-index marca los valores como no verificados.
- Un detector de IA nunca es prueba definitiva: no deberia usarse como unica evidencia en decisiones disciplinarias, legales o editoriales.
- No se especifican sesgos conocidos en la informacion disponible; como todo clasificador entrenado con datos web, puede heredar sesgos de dominio y estilo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre robustez en produccion ni sobre el mantenimiento del modelo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B
- Pesos GGUF: https://huggingface.co/Privoid-ai/Privoid-AIDetect-Qwen3.5-0.8B-GGUF
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset MAGE: https://huggingface.co/datasets/yaful/MAGE
- Dataset RAID: https://huggingface.co/datasets/liamdugan/raid
- Informe tecnico del detector de Mozilla Fakespot: https://github.com/FakespotAILabs/ApolloDFT/blob/main/apollo-text.md
