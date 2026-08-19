# Axilotal/cadquery-lora-cot-v2-step100

## Resumen

El modelo `Axilotal/cadquery-lora-cot-v2-step100` es un adaptador LoRA (Low-Rank Adaptation) diseñado para ajustar el modelo base `unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`, una versión cuantizada a 4 bits de Qwen2.5-Coder-7B-Instruct. El nombre del repositorio sugiere que el adaptador se ha entrenado específicamente para generar código de CadQuery, una librería de Python para modelado paramétrico 3D (CAD), con un enfoque de cadena de pensamiento (chain-of-thought, CoT) para razonar paso a paso antes de emitir el código final.

El adaptador se publica en formato PEFT (Parameter-Efficient Fine-Tuning) y ocupa aproximadamente 0,3 GB, lo que indica que solo contiene los pesos del adaptador, no el modelo completo. La ficha de HuggingFace no incluye documentación detallada: no se especifican datos de entrenamiento, hiperparámetros, licencia ni idiomas soportados. Toda la información técnica más allá de la identidad del adaptador y su modelo base debe considerarse no disponible o inferida a partir del nombre y las etiquetas.

La relevancia de este modelo radica en su especialización aparente en un dominio técnico muy concreto: la generación de scripts de CadQuery. Si el entrenamiento es correcto, podría facilitar la automatización de tareas de diseño paramétrico en entornos de ingeniería y fabricación digital, un área donde los modelos de lenguaje generalistas suelen fallar por falta de datos específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene un numero reducido de parametros; el modelo base tiene 7.600 millones) |
| Parametros activos | No disponible (no se especifica el rank ni la configuracion del adaptador) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-Coder-7B-Instruct soporta hasta 32.768 tokens (dato publico del modelo base, no confirmado en esta ficha) |
| Tipos de cuantizacion | El modelo base se distribuye en 4 bits (bnb-4bit); el adaptador en si no esta cuantizado |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles y codigo; no se indica nada sobre el adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2.5-Coder-7B-Instruct, un modelo de lenguaje de tipo transformer decoder-only con 7.600 millones de parametros, entrenado por Alibaba Cloud para tareas de programacion y razonamiento. La version base utilizada aqui (`unsloth/qwen2.5-coder-7b-instruct-bnb-4bit`) es una cuantizacion a 4 bits mediante bitsandbytes, optimizada para reducir los requisitos de memoria durante el entrenamiento y la inferencia.

El adaptador LoRA se entrena mediante fine-tuning supervisado (SFT), como indican las etiquetas `sft`, `trl` y `unsloth`. El nombre del repositorio (`cadquery-lora-cot-v2-step100`) sugiere que el entrenamiento se ha realizado sobre un conjunto de datos de ejemplos de CadQuery con cadenas de razonamiento (CoT) y que el checkpoint corresponde al paso 100 de entrenamiento. No se dispone de informacion sobre el tamano del dataset, la composicion de los datos, el numero de tokens de entrenamiento ni si se aplicaron tecnicas adicionales como RLHF o DPO. Tampoco se especifican los hiperparametros del adaptador (rank, alpha, dropout, etc.).

## Capacidades

- Generacion de codigo CadQuery: por el nombre del modelo, se infiere que esta especializado en producir scripts de Python que utilizan la libreria CadQuery para crear modelos 3D parametricos.
- Razonamiento paso a paso (chain-of-thought): la etiqueta `cot` sugiere que el modelo genera una explicacion o plan antes de emitir el codigo final, lo que podria mejorar la precision en tareas complejas de modelado.
- Capacidades generales del modelo base: al estar basado en Qwen2.5-Coder-7B-Instruct, hereda las capacidades de generacion de codigo en multiples lenguajes, razonamiento logico y comprension de instrucciones en lenguaje natural, aunque el adaptador puede haberlas sesgado hacia el dominio de CadQuery.
- No se ha confirmado soporte para tool calling, agentes, vision ni audio. La informacion disponible no menciona estas capacidades.

## Casos de uso

Dado que no hay documentacion oficial, los siguientes casos de uso son inferencias razonables basadas en la especializacion aparente del modelo. Deben tomarse como hipotesis, no como capacidades verificadas.

- Generacion de piezas mecanicas parametricas: un ingeniero podria describir en lenguaje natural una pieza (por ejemplo, "un soporte en L con cuatro agujeros de 5 mm") y el modelo generaria el script de CadQuery correspondiente, listo para ejecutar y exportar a STEP o STL.
- Automatizacion de bibliotecas de componentes: en entornos de diseno industrial, el modelo podria ayudar a crear variantes de componentes estandar (bridas, ejes, carcasas) a partir de parametros, reduciendo el tiempo de modelado manual.
- Educacion y formacion en CAD: estudiantes de ingenieria podrian usarlo para entender como se construyen modelos 3D mediante codigo, comparando el razonamiento generado con el codigo final.
- Integracion en pipelines de diseno generativo: el adaptador podria conectarse a herramientas de automatizacion que generen multiples variantes de diseno a partir de especificaciones textuales, acelerando la exploracion de alternativas.
- Asistencia en programacion de scripts de fabricacion digital: para proyectos de impresion 3D o fresado CNC, el modelo podria generar el codigo de modelado que luego se convierte a G-code mediante herramientas como CQ-editor o FreeCAD.
- Prototipado rapido en investigacion: investigadores que trabajen con geometrias parametricas podrian usar el modelo para generar codigo base que luego modifican manualmente, ahorrando tiempo en la sintaxis de CadQuery.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni metricas especificas de generacion de codigo CadQuery. Tampoco se comparan resultados con otros modelos o adaptadores.

## Requisitos de hardware

- Al ser un adaptador LoRA, el modelo debe cargarse junto con el modelo base Qwen2.5-Coder-7B-Instruct cuantizado a 4 bits. Con esa cuantizacion, el modelo base ocupa aproximadamente 4-5 GB en memoria.
- Se estima que una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3070, RTX 4060, o superior) puede ejecutar el modelo en inferencia con cuantizacion 4 bits. Para mayor comodidad y velocidad, se recomienda 12-16 GB (RTX 3080, RTX 4080, etc.).
- En CPU, la inferencia es posible pero lenta; se recomienda usar llama.cpp u Ollama con cuantizacion GGUF si se desea ejecutar sin GPU.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `transformers` y `peft` en Python. Tambien se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque el adaptador deberia fusionarse con el modelo base primero.
- No se dispone de datos de latencia ni throughput. Como referencia, un modelo de 7B en 4 bits en una GPU moderna suele generar entre 20 y 50 tokens por segundo, pero esto depende del hardware y la implementacion.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA especificos para CadQuery en el ecosistema open source. La comparativa mas directa seria con el modelo base sin adaptar:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| Axilotal/cadquery-lora-cot-v2-step100 | Adaptador LoRA sobre 7B | No disponible (base: 32K) | CadQuery + CoT | No disponible |
| Qwen2.5-Coder-7B-Instruct (base) | 7.600 M | 32.768 tokens | Codigo general, razonamiento | Apache 2.0 (segun publicacion de Qwen) |
| CodeLlama-7B-Instruct | 7.000 M | 16.384 tokens | Codigo general | Llama 2 license |

La comparacion es limitada porque no hay datos de rendimiento del adaptador. Se recomienda evaluar el modelo en un conjunto propio de tareas de CadQuery antes de usarlo en produccion.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, pero al ser un modelo entrenado sobre codigo, puede heredar sesgos de los datos de entrenamiento de Qwen2.5-Coder, como preferencia por ciertos estilos de programacion o falta de cobertura de idiomas distintos del ingles.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar codigo sintacticamente valido pero semanticamente incorrecto, especialmente en geometrias complejas. El modo CoT puede mitigar esto, pero no eliminarlo.
- La licencia no esta especificada, lo que impide conocer si el uso comercial esta permitido. Se debe contactar con el autor antes de utilizarlo en proyectos con fines lucrativos.
- El adaptador se ha entrenado aparentemente durante solo 100 pasos (segun el nombre), lo que podria indicar un ajuste insuficiente o un sobreajuste a un dataset pequeno. No hay garantia de generalizacion a casos fuera del dominio de entrenamiento.
- No se ha verificado la calidad del codigo generado. Se recomienda probar exhaustivamente cualquier salida antes de usarla en disenos reales.
- El modelo base esta cuantizado a 4 bits, lo que puede degradar ligeramente la calidad de la generacion en comparacion con una version sin cuantizar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Axilotal/cadquery-lora-cot-v2-step100
- Modelo base (unsloth/qwen2.5-coder-7b-instruct-bnb-4bit): https://huggingface.co/unsloth/qwen2.5-coder-7b-instruct-bnb-4bit
- Documentacion de Qwen2.5-Coder (modelo base): https://qwenlm.github.io/blog/qwen2.5-coder/
- Libreria CadQuery: https://cadquery.readthedocs.io/

No se han encontrado papers, repositorios de codigo ni demos asociados a este adaptador.
