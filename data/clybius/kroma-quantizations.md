# Clybius/Kroma-Quantizations

## Resumen

Kroma-Quantizations es un repositorio de cuantizaciones del modelo Kroma v0.2, un ajuste fino completo (*full fine-tune*) del checkpoint Krea 2 orientado a generacion de imagenes a partir de texto. Lo publica el usuario Clybius (Cole O., investigador en dinamicas de entrenamiento e inferencia) y su proposito es distribuir los pesos de Kroma v0.2 en distintos formatos cuantizados compatibles con ComfyUI, de modo que puedan ejecutarse en hardware mas modesto que el que exigiria el checkpoint completo.

El modelo subyacente, Kroma, lo desarrolla Lodestone-Rock a partir de Krea 2. La version v0.2 se obtuvo continuando el entrenamiento completo sobre el checkpoint K2 que hay detras de Kroma v0.1, sin la compresion mediante delta LoRA de rango 256 que se uso en v0.1, y fusionando despues el delta del checkpoint "Turbo" de Krea 2 como un LoRA de rango 512. Esto permite muestrear con ajustes Turbo (pocos pasos, CFG bajo).

Este repositorio es relevante porque desacopla el modelo de difusion del resto de componentes: no requiere un checkpoint base separado, pero si el text encoder (Qwen3-VL de 12 capas) y el VAE de Krea 2. El tamano del repositorio es de 13,5 GB e incluye varios ficheros en formatos ComfyUI. La licencia de los pesos derivados es MIT, pero los pesos base de Krea 2 siguen sujetos a su propia licencia de comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion para texto-a-imagen; el autor no detalla el tipo de backbone) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen; no hay ventana de contexto de tokens de texto autoregresiva) |
| Tipos de cuantizacion | formatos ComfyUI en .safetensors; la cobertura de la comunidad menciona cuantizaciones INT8, pero la lista completa no se detalla en la informacion disponible |
| Idiomas soportados | no disponible; el text encoder asociado es Qwen3-VL (multilingue), pero la model card no especifica idiomas soportados para los prompts |
| Licencia | el model card indica MIT para el fine-tune; los metadatos de HuggingFace indican `krea-2-community-license`. Los pesos base de Krea 2 se rigen por su propia licencia |
| Formato de pesos | safetensors (.safetensors), en formatos de cuantizacion para ComfyUI |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del backbone de difusion (no se confirma si es un transformer de difusion, un UNet u otra topologia). Si se detalla la cadena de componentes que exige la inferencia en ComfyUI: el modelo de difusion (este repositorio), un text encoder basado en un stack Qwen3-VL de 12 capas cargado con el tipo `krea2`, y el VAE propio de Krea 2. El modelo de difusion puede cargarse directamente sin un checkpoint base adicional.

En cuanto al entrenamiento, Kroma v0.2 se produjo mediante ajuste fino completo y continuado del checkpoint K2 que hay detras de Kroma v0.1, prescindiendo de la compresion de delta LoRA de rango 256 empleada en la version v0.1. Posteriormente se fusiono el delta del checkpoint "Turbo" de Krea 2 como un LoRA de rango 512, lo que habilita el muestreo con ajustes Turbo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline declarado: text-to-image).
- Muestreo en pocos pasos gracias a la fusion del delta Turbo de Krea 2 (configuracion recomendada de 8 a 12 pasos).
- Ejecucion integrada en ComfyUI con soporte nativo de Krea 2, mediante una cadena minima de nodos.
- Compatibilidad con el text encoder Qwen3-VL de 12 capas (tipo `krea2`) y el VAE de Krea 2.
- Distribucion en multiples formatos de cuantizacion, lo que permite elegir el equilibrio entre fidelidad y consumo de recursos.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking".

## Casos de uso

- Generacion de imagenes en ComfyUI: el modelo se carga directamente como diffusion model y se muestrea con 8-12 pasos y CFG 1,0-1,5, lo que permite obtener resultados rapidos sin el coste de un muestreo completo de muchos pasos.
- Produccion por lotes de recursos graficos: para pipelines que generan ilustraciones, conceptos o material de marketing de forma masiva, las cuantizaciones reducen el coste por imagen y facilitan el despliegue en nodos con GPU de gama media.
- Prototipado rapido de estilos: al ser un fine-tune completo (no un LoRA), captura mejor la distribucion del estilo objetivo de Kroma, util para explorar direcciones artisticas antes de invertir en entrenamientos propios.
- Iteracion sobre prompts en diseno: la combinacion de pocos pasos y CFG bajo permite ciclos de prueba cortos en los que el disenador ajusta el prompt y ve el resultado en segundos.
- Integracion en herramientas creativas basadas en ComfyUI: al distribuirse en formatos nativos de ComfyUI, encaja en flujos existentes que ya usan el text encoder y el VAE de Krea 2.
- Demostraciones y evaluacion de cuantizaciones: el repositorio agrupa varias precisiones, lo que permite comparar fidelidad frente a consumo dentro del mismo flujo de trabajo.
- Investigacion sobre fusion de deltas: el modelo ilustra la fusion de un delta Turbo como LoRA de rango 512, util como referencia para experimentos de merging de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 13,5 GB, pero contiene varios ficheros en distintos formatos de cuantizacion, por lo que el peso individual de cada fichero es menor que esa cifra total.
- La VRAM necesaria depende de la cuantizacion elegida, del text encoder (stack Qwen3-VL de 12 capas) y del VAE. No se proporciona una cifra de VRAM concreta en la informacion disponible.
- Como estimacion orientativa basada en el tamano del repositorio, las cuantizaciones mas agresivas (por ejemplo INT8 u otras bajas precisiones) podrian caber en GPUs de consumo con 16-24 GB (serie RTX 4080/4090), siempre que el text encoder y el VAE se gestionen con cuidado; esta estimacion no esta confirmada por el autor.
- Opciones de despliegue: ComfyUI es el entorno documentado explicitamente. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje y no a este tipo de modelo de difusion.
- No se publican datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clybius/Kroma-Quantizations | Cuantizaciones de Kroma v0.2 | no disponible | no aplica | MIT segun model card; metadatos HF: krea-2-community-license | HuggingFace (Clybius) |
| Kroma v0.2 (lodestones/Kroma) | Modelo original, sin cuantizar | no disponible | no aplica | no disponible en la informacion proporcionada | HuggingFace (lodestones) |
| Krea 2 (Krea/Krea-2) | Modelo base | no disponible | no aplica | krea-2-community-license | HuggingFace (Krea) |
| lodestones/Chroma | Modelo relacionado del mismo autor de Kroma | no disponible | no aplica | no disponible | HuggingFace (lodestones) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la informacion disponible; los sesgos vendrian heredados del dataset de entrenamiento de Krea 2 y del propio fine-tune, que no se detalla.
- Riesgo de alucinacion visual y de incoherencias en el resultado inherente a los modelos de difusion; no se aportan tasas ni evaluaciones.
- La model card advierte de que si la salida no es correcta hay que confirmar que el text encoder se carga con el tipo `krea2` (stack Qwen3-VL de 12 capas) y que se usa una version reciente de ComfyUI.
- Los ajustes de muestreo deben respetarse (8-12 pasos, CFG 1,0-1,5, shift 1,15), ya que son aquellos para los que se destilo el checkpoint Turbo; usar otros valores puede degradar el resultado.
- Discrepancia de licencia: el model card del repositorio declara MIT, mientras que los metadatos de HuggingFace indican `krea-2-community-license`. Ademas, el propio autor aclara que el fine-tune no concede derechos sobre los pesos base de Krea 2. Es imprescindible revisar la licencia de Krea 2 antes de cualquier uso comercial.
- El repositorio no incluye el text encoder ni el VAE, que deben descargarse por separado para poder ejecutar el modelo.
- No se especifican idiomas soportados ni limitaciones de contexto, por lo que no puede garantizarse un comportamiento uniforme en todos los idiomas de prompt.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Clybius/Kroma-Quantizations
- Modelo Kroma original (Lodestone-Rock): https://huggingface.co/lodestones/Kroma
- Modelo base Krea 2: https://huggingface.co/Krea/Krea-2
- Perfil de Clybius en HuggingFace: https://huggingface.co/Clybius/models
- Cuantizaciones Chroma-GGUF (related, mismo autor): https://huggingface.co/Clybius/Chroma-GGUF
- Cobertura en ComfyUI Wiki sobre Kroma v0.2: https://comfyui-wiki.com/en/news/2026-08-09-kroma-v0-2
- Perfil de Clybius en GitHub: https://github.com/Clybius
- Ficha de Chroma-GGUF en AIBase (referencia): https://model.aibase.com/models/details/1915687235313418241
