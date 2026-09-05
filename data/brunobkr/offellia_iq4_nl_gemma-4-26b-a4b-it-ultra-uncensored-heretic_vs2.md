# Brunobkr/OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic_vs2

## Resumen

El modelo **OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic_vs2** es una cuantización GGUF creada por el usuario **Brunobkr** a partir de un modelo de lenguaje perteneciente a la familia Gemma, según su denominación. Se trata de un derivado calificado como **ultra-uncensored**, **heretic** y **abliterated**, lo que indica que se han aplicado técnicas para eliminar o reducir las restricciones de contenido del modelo original. El sistema de cuantización es propio y se denomina **Zetahelicoidal (Q4_2_H)**, implementado sobre un fork de llama.cpp. El archivo pesa **14.9 GB** y se distribuye en formato GGUF, compatible con herramientas como llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui.

Su principal atractivo es la ejecución local en hardware doméstico, gracias a la cuantización que reduce el espacio necesario en memoria sin sacrificar el acceso a un modelo de arquitectura MoE con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos. La ausencia de censura puede interesar a investigadores del comportamiento de modelos sin alineamiento, pero también introduce riesgos de seguridad y de licencia que deben considerarse antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (segun la denominacion del modelo 26B-A4B) |
| Parametros totales | 26B (segun la denominacion del modelo) |
| Parametros activos | 4B (segun la denominacion del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion Zetahelicoidal Q4_2_H (bloque de 24 elementos); la designacion "IQ4_NL" del nombre indica ademas cuantizacion IQ4_NL |
| Idiomas soportados | multilingue, ingles y portugues (segun metadatos) |
| Licencia | refer-to-base-model (remite a la licencia del modelo base, no detallada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles del proceso de entrenamiento del modelo original, como numero de tokens, composicion del dataset o tecnicas de alineamiento. Los metadatos indican que se trata de un derivado cuantizado que ha sido sometido a un proceso de **abliteracion**, con etiquetas como "ultra-uncensored" y "heretic". Esto sugiere que se han eliminado o minimizado las restricciones de contenido habituales en modelos alineados.

La innovacion tecnica documentada es el **fork de llama.cpp** creado para soportar la cuantizacion **Q4_2_H** de tipo helicoidal, con un tamano de bloque de **24 elementos** en lugar de los 42 originales. Este ajuste resuelve problemas de divisibilidad con dimensiones de tensores frecuentes en modelos modernos (1536, 2048, 4096, 6912, 8192), eliminando los fallbacks a Q4_0. El fork tambien elimina verificaciones de integridad de compilacion y restricciones de Service Worker/PWA, y anade soporte en herramientas como `convert_hf_to_gguf.py` y `llama-quantize`. No se especifican los datos exactos de entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional: el modelo esta disenado para mantener dialogos y responder preguntas en formato texto.
- Multilingue: segun los metadatos, soporta multiples idiomas, con presencia explicita de ingles y portugues.
- Carga como GGUF: permite ejecucion en llama.cpp, llama-server, Ollama, LM Studio, KoboldCpp y text-generation-webui.
- Personalidad "uncensored": se ha aplicado abliteracion para reducir el rechazo a ciertas tematicas, lo que puede resultar en respuestas mas directas en contenidos que otros modelos rechazan.
- Sin vision, audio ni tool calling: no se dispone de informacion sobre capacidades multimodales ni funciones de llamada a herramientas.

## Casos de uso

1. **Chatbot local sin conexion**: el modelo puede desplegarse en una GPU domestica (por ejemplo, RTX 3090 o superior) mediante Ollama o LM Studio para crear un asistente de conversacion privado, sin depender de APIs externas. Su cuantizacion en GGUF permite cargarlo con menos memoria que un modelo sin cuantizar.

2. **Asistente bilingue portugues-ingles**: gracias a su enfoque en estos dos idiomas, puede usarse como traductor conversacional o asistente de redaccion para usuarios lusofonos que necesitan interactuar en ingles y portugues, en una misma sesion de chat.

3. **Experimentacion con modelos "uncensored"**: investigadores interesados en el comportamiento de modelos sin alineamiento pueden estudiar sus respuestas en temas sensibles o contrastarlas con modelos alineados de la misma familia, para analizar los efectos de la abliteracion.

4. **Investigacion en cuantizacion personalizada**: el fork de llama.cpp con Q4_2_H (bloque de 24) permite probar esquemas de cuantizacion alternativos y evaluar su impacto en precision, tamano y rendimiento frente a las cuantizaciones estandar.

5. **Despliegue en servidores con recursos limitados**: mediante `llama-server` se puede ofrecer un endpoint de generacion de texto interno para aplicaciones de empresa, siempre que se acepten los riesgos derivados de la ausencia de censura. Al ser un modelo MoE con 4B activos, podria presentar latencias razonables en CPU con suficiente RAM.

6. **Generacion de contenido en portugues**: puede integrarse en pipelines de creacion de articulos, publicaciones en redes sociales o textos de marketing, aprovechando su dominio del portugues y su estructura conversacional, aunque sin una ventana de contexto documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa **14.9 GB**. Para cargar el modelo completo en VRAM y reservar espacio para la cache KV, se recomienda al menos **16-20 GB de VRAM**.
- GPU recomendadas: **RTX 3090 (24 GB)**, **RTX 4090 (24 GB)**, **A100 (40/80 GB)** o **H100**. En GPUs de 12-16 GB es posible ejecutar el modelo con offloading parcial hacia CPU.
- En CPU: al ser un modelo MoE con unos 4B parametros activos, podria funcionar con 32 GB de RAM mediante `llama.cpp` con cuantizacion Q4, aunque la velocidad dependera del numero de hilos.
- Opciones de despliegue: `llama.cpp` con el fork helicoidal, `llama-server`, `Ollama`, `LM Studio`, `KoboldCpp` y `text-generation-webui`.
- Latencia y throughput: no se dispone de medidas publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos similares. El modelo es un derivado cuantizado con un esquema de cuantizacion personalizado, y no existen datos de benchmarks ni referencias a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Licencia incierta**: la etiqueta `refer-to-base-model` remite a la licencia del modelo base, que no se especifica. Esto puede impedir el uso comercial si la licencia original no lo permite.
- **Contenido problematico**: por su diseno "uncensored" y "abliterated", el modelo puede generar contenido explicito, violento o danino. No es apto para entornos con menores ni para produccion sin supervision.
- **Alucinacion**: al no haber benchmarks publicados, la calidad de las respuestas es desconocida. Existe el mismo riesgo de alucinacion que en cualquier modelo de lenguaje no evaluado.
- **Longitud de contexto no documentada**: no se conoce la ventana de contexto real, lo que puede afectar a tareas que requieran memoria extensa o dialogo de multiples turnos.
- **Compatibilidad limitada**: la cuantizacion Q4_2_H es una funcionalidad de un fork concreto de llama.cpp. Las versiones estandar de llama.cpp o herramientas que no hayan incorporado ese fork podrian no reconocer el archivo con esta cuantizacion.
- **Idiomas**: a pesar de la etiqueta "multilingual", la documentacion destaca ingles y portugues. El rendimiento en otros idiomas no esta garantizado.
- **Riesgo de seguridad**: al ser un modelo "heretic" y sin controles, puede utilizarse para generar contenido malicioso. No se recomienda su exposicion publica sin filtros adicionales.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/Brunobkr/OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic_vs2](https://huggingface.co/Brunobkr/OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic_vs2)
- Archivo GGUF directo: [https://huggingface.co/Brunobkr/OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf](https://huggingface.co/Brunobkr/OFFELLIA_IQ4_NL_gemma-4-26B-A4B-it-ultra-uncensored-heretic.gguf)
