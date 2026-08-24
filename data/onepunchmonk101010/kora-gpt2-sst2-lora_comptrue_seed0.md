# OnePunchMonk101010/kora-gpt2-sst2-lora_compTrue_seed0

## Resumen
Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre GPT-2 para la tarea de clasificación de sentimiento binaria en el dataset SST-2 (Stanford Sentiment Treebank). El adaptador fue desarrollado por OnePunchMonk101010 como parte del proyecto KoRA, una librería de investigación sobre adaptación eficiente de parámetros. El objetivo es evaluar la transferencia de conocimiento a un dominio cercano, en este caso el dataset Rotten Tomatoes, donde se obtiene una precisión de 0,8696 en configuración few-shot.

El adaptador solo contiene 1,18 millones de parámetros entrenables, que representan el 0,94 % de los 125,6 millones del modelo base GPT-2. Esto lo convierte en un ejemplo de aprendizaje por transferencia paramétricamente eficiente, adecuado para entornos con recursos limitados. La relevancia actual radica en su demostración de que es posible adaptar modelos grandes de lenguaje a tareas específicas con un coste computacional reducido, una práctica habitual en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (modelo base) + adaptador LoRA |
| Parametros totales | 125,620,994 (modelo base) + 1,181,186 (adaptador LoRA) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base: 1024 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset SST-2 en ingles) |
| Licencia | no disponible |
| Formato de pesos | `adapter.pt` (state_dict de PyTorch) |

## Arquitectura y entrenamiento
El modelo base es GPT-2, un transformer autoregresivo con 125 millones de parametros y 12 capas. Sobre este se aplica un adaptador LoRA, que descompone las matrices de peso en factores de bajo rango durante el fine-tuning. Esto permite actualizar solo una pequeña fraccion de los parametros (0,94 %) en lugar de ajustar toda la red. El entrenamiento se realizo sobre el dataset SST-2, que contiene frases etiquetadas como positivas o negativas. No se menciona si se utilizo RLHF o DPO; el proceso es un fine-tuning supervisado estandar. La innovacion principal es la evaluacion de transferencia a Rotten Tomatoes, un dataset similar pero distinto, para medir la capacidad de generalizacion del adaptador.

## Capacidades
- Clasificacion de sentimiento binario (positivo/negativo) sobre texto corto.
- Transferencia few-shot a datasets de dominio similar (demostrada con Rotten Tomatoes).
- Inferencia eficiente al ser un adaptador de bajo rango que no aumenta la latencia de forma significativa.
- No soporta generacion de texto general, ni tool calling, ni agentes, ni vision, ni audio.
- Capacidades multilingues: no se especifican, el entrenamiento fue en ingles.

## Casos de uso
- Analisis de opiniones en redes sociales: se puede integrar en un pipeline que procese tweets o comentarios para detectar sentimiento negativo o positivo, aprovechando su baja huella de memoria.
- Moderacion de contenido: clasificar reseñas o comentarios como abusivos o positivos en plataformas de comercio electronico.
- Filtrado de feedback en encuestas: categorizar respuestas abiertas de clientes en funcion de su polaridad.
- Investigacion academica sobre PEFT (Parameter-Efficient Fine-Tuning): el adaptador sirve como referencia para experimentos de transferencia y comparacion de metodos.
- Prototipado rapido en entornos con GPU limitada: al ser un adaptador pequeno, se puede cargar junto a GPT-2 en una GPU de 8 GB sin problemas.
- Evaluacion de robustez de adaptadores: permite estudiar como degrada la precision al transferir a un dataset no visto.

## Benchmarks y rendimiento
Se han publicado resultados de validacion en SST-2 y transferencia a Rotten Tomatoes:

| Dataset | Metrica | Valor |
|---|---|---|
| SST-2 (validacion) | Accuracy | 0,9174 |
| Rotten Tomatoes (few-shot transfer) | Accuracy | 0,8696 |

No hay comparacion con otros modelos en la informacion disponible. Estos valores indican una perdida de 4,78 puntos porcentuales en la transferencia, un resultado razonable para un adaptador con solo 0,94 % de parametros entrenables.

## Requisitos de hardware
- VRAM estimada: para inferencia con GPT-2 base (124 M) en FP16 se requieren aproximadamente 250 MB de VRAM, mas el adaptador (unos 5 MB). En FP32, alrededor de 500 MB. Cualquier GPU con mas de 1 GB puede ejecutarlo.
- GPU recomendadas: cualquier GPU moderna, desde una NVIDIA GTX 1050 Ti hasta una A100. En CPU, tambien es viable gracias al reducido tamano del modelo.
- Compatible con consumer GPU: si, todas las GPU de consumo con al menos 2 GB de VRAM son suficientes.
- Opciones de despliegue: se puede cargar en PyTorch directamente con el state_dict, o integrar en vLLM si se combina con el modelo base. No se ha probado con llama.cpp ni Ollama, pero al ser GPT-2, es probable que funcione con herramientas que soporten este modelo.
- Latencia y throughput: no se han publicado datos, pero para un modelo de 124M, la latencia en GPU es inferior a 10 ms por ejemplo, y en CPU del orden de 100 ms.

## Comparativa con modelos similares
No se dispone de modelos comparables en la informacion proporcionada. Como adaptador LoRA sobre GPT-2, se podria comparar con otros adaptadores de la misma tarea, pero no hay datos publicos.

## Limitaciones y advertencias
- Es un adaptador, no un modelo completo: requiere cargar el modelo base GPT-2 y luego aplicar el estado del adaptador.
- No soporta generacion de texto general; solo produce una etiqueta de clasificacion (positivo/negativo).
- El dataset SST-2 esta en ingles y contiene frases cortas; su rendimiento en otros idiomas o textos largos no esta validado.
- No se conoce la licencia exacta del modelo ni del adaptador, por lo que el uso comercial puede estar restringido.
- No se han evaluado sesgos de genero, raza o etnia en la clasificacion. Al ser un clasificador de sentimiento, podria tener sesgos linguisticos.
- Riesgo de alucinacion: no aplica, ya que no genera texto.
- La transferencia a Rotten Tomatoes es few-shot, pero no se especifica el numero de ejemplos usados; la precision podria variar con el tamano del conjunto de few-shot.

## Enlaces
- Repositorio del adaptador: https://huggingface.co/OnePunchMonk101010/kora-gpt2-sst2-lora_compTrue_seed0
- Proyecto KoRA: https://github.com/OnePunchMonk/KoRA
