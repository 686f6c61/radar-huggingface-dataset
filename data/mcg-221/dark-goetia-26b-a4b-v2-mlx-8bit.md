# McG-221/Dark-Goetia-26B-A4B-v2-mlx-8Bit

## Resumen

Dark-Goetia-26B-A4B-v2-mlx-8Bit es una conversión al formato MLX del modelo Dark-Goetia-26B-A4B-v2, realizada por McG-221 con la librería mlx-lm versión 0.31.2. El modelo original, desarrollado por 26B-Suite, está orientado a conversación y roleplay, con soporte para herramientas como SillyTavern. Según los metadatos, el modelo base está licenciado bajo Gemma, lo que sugiere una arquitectura derivada de la familia Gemma de Google, aunque no se confirma explícitamente.

El nombre del modelo indica una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parámetros totales y 4 mil millones activos (A4B), pero los pesos incluidos en este repositorio suman 7.097.324.574 parámetros, una cifra considerablemente menor. Esto podría deberse a que el archivo contiene únicamente un adaptador LoRA o a una cuantización parcial, aunque no se especifica en la documentación. La conversión está cuantizada a 8 bits y soporta los idiomas inglés y ruso.

Este modelo resulta relevante para desarrolladores que trabajan en aplicaciones de rol, chatbots conversacionales o sistemas de narración interactiva, especialmente en entornos Apple Silicon gracias al formato MLX. Su integración con SillyTavern y su naturaleza multilingüe lo convierten en una opción práctica para proyectos de ficción interactiva y simulación de personajes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 26B totales y 4B activos, pero no confirmado) |
| Parametros totales | 7.097.324.574 |
| Parametros activos | no disponible (el nombre sugiere 4B, pero no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (indicado en el nombre y en la conversion MLX) |
| Idiomas soportados | ingles, ruso |
| Licencia | gemma |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. El nombre "Dark-Goetia-26B-A4B-v2" sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parametros totales y 4 mil millones activos, tipica de modelos como Mixtral. Sin embargo, los pesos reales en este repositorio suman 7.097.324.574 parametros, lo que contradice esa cifra. Es posible que el archivo contenga un adaptador LoRA (el tag "lora" esta presente) o una version parcial del modelo original, pero no hay documentacion que lo aclare.

El modelo base esta licenciado bajo Gemma, lo que implica que su arquitectura podria basarse en los transformers de Google, pero no se confirma. Tampoco se proporcionan datos sobre el conjunto de entrenamiento, el numero de tokens, ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion adicional es que fue convertido a MLX usando mlx-lm 0.31.2, lo que indica que esta optimizado para ejecutarse en hardware Apple Silicon mediante la libreria MLX.

## Capacidades

- Generacion de texto conversacional y narrativo, especialmente orientado a roleplay y ficcion interactiva.
- Soporte para integracion con SillyTavern, una interfaz popular para juegos de rol y chatbots.
- Capacidades multilingues en ingles y ruso, lo que permite conversaciones en ambos idiomas.
- Al estar basado en un modelo con licencia Gemma, podria heredar capacidades generales de generacion de texto, razonamiento y comprension del lenguaje, aunque no se especifican.
- No se mencionan capacidades de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo esta disenado para mantener conversaciones de caracter con contextos narrativos, y puede integrarse en plataformas como SillyTavern para juegos de rol textuales.
- Chatbots de personajes: permite crear asistentes conversacionales con personalidad definida, utiles en entretenimiento o simulacion de personajes historicos o ficticios.
- Escritura creativa asistida: puede generar dialogos y narraciones en ingles o ruso, sirviendo como herramienta de apoyo para autores.
- Traduccion y adaptacion de contenido narrativo: gracias a su soporte bilingue, puede ayudar a traducir o adaptar historias entre ingles y ruso.
- Prototipado rapido de aplicaciones de chat: al estar en formato MLX, es facil de desplegar en Macs con Apple Silicon para pruebas de concepto.
- Educacion y practica de idiomas: puede usarse como companero de conversacion en ingles o ruso para estudiantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser una conversion MLX, esta optimizado para Apple Silicon (M1, M2, M3 y posteriores) con memoria unificada.
- El tamano del repositorio es de 26.8 GB, pero los parametros reales son 7.097 millones, por lo que con cuantizacion de 8 bits la memoria necesaria para cargar el modelo se estima en torno a 7-8 GB de RAM unificada.
- Se recomienda un Mac con al menos 16 GB de RAM para una ejecucion comoda, aunque podria funcionar con 8 GB con limitaciones.
- No se proporcionan datos de latencia ni throughput, pero al ser un modelo de ~7B en 8-bit, se espera un rendimiento aceptable en hardware Apple Silicon moderno.
- Para despliegue, se utiliza la libreria mlx-lm, que permite cargar y generar texto con pocas lineas de codigo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos. El nombre sugiere una arquitectura MoE similar a Mixtral 8x7B, pero los parametros reales son mucho menores. Dado que no hay datos de rendimiento ni de arquitectura confirmada, no es posible comparar objetivamente con alternativas como Mistral 7B, Llama 3 8B o Gemma 7B.

## Limitaciones y advertencias

- La licencia Gemma impone restricciones de uso comercial: las empresas con mas de 100 millones de usuarios mensuales o ingresos superiores a 10 millones de dolares deben solicitar permiso a Google. Esto puede afectar a despliegues empresariales.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones especificas del modelo, por lo que se recomienda evaluarlo en el dominio de uso antes de desplegarlo en produccion.
- El modelo esta orientado a roleplay y conversacion, por lo que su rendimiento en tareas tecnicas o de razonamiento formal podria ser limitado.
- Al ser una conversion MLX, solo puede ejecutarse en hardware Apple Silicon; no es compatible directamente con CUDA o ROCm sin pasos adicionales.
- La discrepancia entre el nombre (26B-A4B) y los parametros reales (7.1B) sugiere que podria tratarse de un adaptador o de una version parcial, lo que podria afectar a la calidad del modelo si se usa como si fuera el modelo completo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/McG-221/Dark-Goetia-26B-A4B-v2-mlx-8Bit
- Modelo base: https://huggingface.co/26B-Suite/Dark-Goetia-26B-A4B-v2
