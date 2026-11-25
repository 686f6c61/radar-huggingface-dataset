# FactorialGenrativeModals/factorial-ai

## Resumen

Factorial AI es un modelo de lenguaje compacto de 1.346.471.936 parámetros (aproximadamente 1,3B), desarrollado por FactorialGenrativeModals como un ajuste fino del modelo base `deepseek-ai/deepseek-coder-1.3b-instruct`. Está orientado a tareas de programación, investigación web y diseño front-end, con capacidad declarada de tool calling para inspeccionar ficheros, ejecutar comandos y buscar en la web. Se distribuye cuantizado en formato GGUF q4_k_M, pensado para ejecutarse en GPUs de 4 GB de VRAM, y el autor indica que fue probado en una Quadro P2000.

El modelo resuelve el problema de disponer de un asistente local de código y front-end en hardware modesto, sin dependencia de servicios en la nube. Su relevancia es principalmente práctica: demuestra un flujo completo de ajuste con QLoRA (4-bit NF4), fusión de pesos y exportación a GGUF, con compatibilidad con llama.cpp, LM Studio y Bionic. No obstante, al tratarse de un modelo de 1,3B parámetros, sus capacidades de razonamiento complejo son limitadas y el propio autor advierte de riesgo de alucinación en APIs y tareas multi-fichero.

La longitud de contexto de entrenamiento es de 1024 tokens, con funcionamiento declarado hasta 8192 tokens pero con degradación más allá del rango entrenado. El repositorio ocupa 0,9 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de deepseek-coder-1.3b-instruct); detalles internos no disponibles |
| Parametros totales | 1.346.471.936 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenado a 1024 tokens; funciona hasta 8192 con degradacion |
| Tipos de cuantizacion | GGUF q4_k_M (publicado); otros tipos no disponibles |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de `deepseek-ai/deepseek-coder-1.3b-instruct`, un transformer decoder-only de 1,3B parámetros especializado en código. Sobre esa base se aplicó un ajuste fino con QLoRA en 4-bit NF4, tras lo cual los adaptadores se fusionaron con los pesos base y el resultado se exportó a GGUF con cuantización q4_k_M. La model card no detalla la configuración de LoRA (rango, alpha, capas objetivo) ni el número total de tokens de entrenamiento.

Los datos de entrenamiento declarados incluyen CodeAlpaca-20K, Magicoder-OSS-Instruct, 119 sitios web curados con HTML/CSS/JS y ficheros largos de la librería estándar de Python acompañados de explicaciones. El entrenamiento se realizó a 1024 tokens de contexto. No se menciona uso de RLHF ni DPO; el ajuste parece ser supervisado (SFT) sobre instrucciones. El autor indica que el modelo no fue entrenado con datos privados ni filtrados. Como innovación destacable, la model card documenta una configuración de inferencia específica para GPUs Pascal (Quadro P2000): offload de las 28 capas a GPU, Flash Attention desactivado y KV cache en f16, por incompatibilidad de la combinación flash-attention + KV q8 en esa arquitectura.

## Capacidades

- Generación y explicación de código en Python, HTML, CSS y JavaScript.
- Generación de scaffolding front-end (estructura HTML/CSS/JS) a partir de instrucciones.
- Explicación de código y asistencia en depuración.
- Tool calling / function calling: el modelo puede invocar herramientas para inspeccionar ficheros, ejecutar comandos y buscar en la web, según la model card.
- Investigación web asistida por herramientas (no búsqueda nativa integrada en el modelo).
- Conversación multi-turno (etiqueta `conversational`).
- Capacidades multilingües: no disponibles de forma explícita; la model card no documenta cobertura por idioma.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente local de programación en estaciones de trabajo con GPU modesta: con cuantización q4_k_M y 4 GB de VRAM, puede ejecutarse en una Quadro P2000 o similar para autocompletar y explicar scripts pequeños de Python sin enviar código a la nube.
- Generación de scaffolding front-end: a partir de una descripción, produce estructura HTML, estilos CSS y lógica JavaScript básica, útil para prototipos rápidos y maquetación inicial.
- Explicación y depuración de fragmentos de código: el modelo puede razonar sobre un fichero o función concreta y proponer correcciones, adecuado para tareas acotadas de un solo fichero.
- Agente local con tool calling para inspección de ficheros y ejecución de comandos: integrado en un agente tipo Bionic, puede listar directorios, leer ficheros y ejecutar comandos sencillos dentro de un flujo controlado.
- Investigación web asistida: mediante herramientas externas de búsqueda, el modelo puede resumir páginas y extraer información técnica, útil para consultas puntuales de documentación.
- Entornos de desarrollo sin conectividad o con requisitos de privacidad: al ser local y con licencia MIT, permite desplegar asistencia de código en máquinas aisladas donde no se permite el envío de datos a APIs externas.
- Educación y aprendizaje de programación: puede explicar conceptos de Python y front-end con ejemplos ejecutables y explicaciones breves, en un contexto de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4 GB con la cuantización q4_k_M publicada (el autor indica que está pensada para GPUs de 4 GB).
- GPU probada por el autor: Quadro P2000 (arquitectura Pascal), con offload de las 28 capas a GPU.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutarlo en q4_k_M (por ejemplo, GTX 1650, RTX 3050, RTX 4060). No se aportan datos de rendimiento en A100/H100.
- Configuración recomendada por el autor para P2000: contexto 8192 (fallback 4096), GPU offload de todas las capas (28), Flash Attention desactivado, KV cache en f16, un solo modelo cargado a la vez y cerrar procesos GPU del navegador antes de cargar.
- Opciones de despliegue: llama.cpp, LM Studio y Bionic (según la model card). Compatible con endpoints (`endpoints_compatible` en los tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Factorial AI | 1,346B | 1024 entrenado / 8192 con degradacion | MIT | GGUF q4_k_M | Ajuste QLoRA de deepseek-coder-1.3b-instruct |
| deepseek-ai/deepseek-coder-1.3b-instruct | 1,3B | No disponible en la informacion | No disponible en la informacion | Safetensors (modelo base) | Modelo base sin ajuste adicional |
| Alternativas de ~1,3B para codigo | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Riesgo de alucinación de APIs y funciones: el propio autor advierte que, con 1,3B parámetros, el modelo inventará APIs y cometerá errores en tareas complejas multi-fichero. Es imprescindible verificar el código generado antes de usarlo.
- No es un modelo de razonamiento de frontera: no debe emplearse para tareas que requieran razonamiento profundo, planificación compleja o refactorizaciones amplias.
- Contexto limitado: entrenado a 1024 tokens; aunque funciona hasta 8192, hay degradación más allá del rango de entrenamiento, lo que afecta a conversaciones largas y ficheros extensos.
- Idiomas: la model card no documenta cobertura multilingüe; el rendimiento fuera del inglés no está garantizado.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de deepseek-coder-1.3b-instruct conviene revisar las condiciones del modelo base.
- Configuración de hardware específica: en GPUs Pascal es necesario desactivar Flash Attention y usar KV cache en f16; combinaciones no soportadas pueden provocar inestabilidad.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/FactorialGenrativeModals/factorial-ai
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-1.3b-instruct
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
