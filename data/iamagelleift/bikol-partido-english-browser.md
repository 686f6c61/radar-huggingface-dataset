# iamagelleift/bikol-partido-english-browser

## Resumen

El modelo `iamagelleift/bikol-partido-english-browser` es un traductor automático neuronal basado en la arquitectura Marian, preparado específicamente para su ejecución en navegador mediante la biblioteca Transformers.js y ONNX Runtime Web. Su propósito principal es ofrecer traducción entre inglés y bikol partido, una variante del bikol hablado en la provincia de Camarines Sur (Filipinas), con un enfoque claro en el despliegue cliente-servidor sin necesidad de infraestructura en la nube.

El repositorio contiene únicamente los artefactos de despliegue: un encoder cuantizado (q8), un decoder fusionado cuantizado, el tokenizador con sus archivos SentencePiece y los archivos de configuración del modelo y de generación. No se incluyen los checkpoints de entrenamiento originales, el corpus de entrenamiento ni memorias de traducción, por lo que el modelo debe tratarse como una caja negra lista para usar en producción ligera.

La relevancia de este modelo reside en su capacidad para llevar traducción de una lengua regional filipina con escasos recursos digitales a entornos web sin conexión a servidores externos, lo que puede ser útil para aplicaciones de accesibilidad, turismo o preservación lingüística. Sin embargo, la ausencia de documentación pública sobre el entrenamiento y los benchmarks limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (Transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (ONNX, cuantizacion de 8 bits) |
| Idiomas soportados | en (ingles), bcl (bikol partido) |
| Licencia | no disponible |
| Formato de pesos | ONNX (cuantizado q8), safetensors probablemente no presente |

## Arquitectura y entrenamiento

La arquitectura es un modelo Marian, es decir, un transformer encoder-decoder estándar originalmente desarrollado por el equipo de traducción automática de la Universidad de Edimburgo. Marian es una implementación eficiente de la arquitectura transformer para traducción automática neuronal, conocida por su buen rendimiento en lenguas con pocos recursos. En este caso, el modelo ha sido convertido a formato ONNX y cuantizado a 8 bits para reducir su tamaño (0.2 GB) y permitir su ejecución en navegador con Transformers.js.

Los detalles del entrenamiento no están disponibles: no se conoce el número de tokens, la composición del dataset, ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se especifica si el modelo fue entrenado desde cero o fine-tuneado a partir de un modelo Marian preexistente. La model card solo indica que los checkpoints originales y el corpus no se incluyen en el repositorio público.

## Capacidades

- Traducción automática entre inglés y bikol partido en ambas direcciones (probablemente, aunque la model card solo menciona "English–Bikol Partido translator").
- Ejecución completamente en cliente (navegador) mediante Transformers.js y ONNX Runtime Web, sin necesidad de servidor.
- Cuantizacion q8 que reduce el tamaño del modelo a 0.2 GB, permitiendo su carga en dispositivos con recursos limitados.
- Capacidad de traducción de texto de entrada variable, aunque sin especificar límites de longitud.
- No se indica soporte para tool calling, agentes, visión, audio ni otras capacidades multimodales.

## Casos de uso

- Aplicaciones web de traducción para turistas que visitan la región de Bicol: el modelo puede integrarse en una SPA (single-page application) que traduzca frases comunes del inglés al bikol partido y viceversa, funcionando sin conexión a internet y sin enviar datos a servidores externos.
- Herramientas de preservación lingüística: organizaciones locales pueden usar este modelo para digitalizar documentos históricos en bikol partido y traducirlos al inglés, o para generar material educativo bilingüe.
- Extensiones de navegador para traducción contextual: dado su formato ONNX ligero, puede cargarse como extensión de Chrome o Firefox que traduzca páginas web o selecciones de texto entre inglés y bikol partido en tiempo real.
- Asistentes de comunicación para hablantes de bikol partido en entornos médicos o legales: el modelo puede integrarse en aplicaciones de chat o formularios para facilitar la comunicación entre pacientes y profesionales que no comparten idioma.
- Generación de subtítulos o transcripciones bilingües para contenido audiovisual local: aunque no hay soporte de audio, el modelo puede traducir textos transcritos previamente.
- Aplicaciones educativas para aprender bikol partido: el modelo puede servir como herramienta de práctica de traducción en aplicaciones de aprendizaje de idiomas, ofreciendo retroalimentación inmediata al estudiante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones BLEU, chrF ni comparaciones con otros modelos de traducción para bikol partido.

## Requisitos de hardware

- Tamaño del repositorio: 0.2 GB, lo que corresponde al modelo cuantizado q8. La VRAM o RAM necesaria para inferencia dependerá del runtime (Transformers.js usa WebAssembly o WebGPU).
- Para ejecución en navegador: se recomienda un dispositivo con al menos 512 MB de memoria disponible para el modelo, aunque el uso real puede variar según el tamaño del lote y la longitud del texto.
- GPU: no es estrictamente necesaria; Transformers.js puede ejecutarse en CPU (WebAssembly) o acelerarse con WebGPU si el navegador lo soporta. Una GPU integrada moderna es suficiente.
- Opciones de despliegue: Transformers.js (navegador, Node.js), ONNX Runtime Web. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, dado que el formato es ONNX, no GGUF.
- Latencia y throughput: no disponibles. Al tratarse de un modelo q8 pequeño, se espera una latencia aceptable en navegador para frases cortas, pero no hay datos publicados.

## Comparativa con modelos similares

No hay modelos comparables específicos para traducción inglés-bikol partido en el ecosistema de código abierto con formato ONNX para navegador. Existen servicios comerciales como Google Translate o Polytranslator que ofrecen traducción al bikol, pero no son modelos abiertos. Se puede mencionar que el modelo Marian original de Helsinki-NLP (opus-mt) cubre muchos pares de lenguas, pero no se ha publicado una variante para bikol partido. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La model card advierte explícitamente que las traducciones pueden contener imprecisiones, especialmente para oraciones largas, complejas o poco familiares. Se recomienda revisión humana.
- No se incluyen los datos de entrenamiento ni los checkpoints originales, por lo que no es posible auditar el proceso de entrenamiento ni identificar sesgos potenciales.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución. Se debe contactar al autor antes de usarlo en producción.
- El modelo está limitado a dos idiomas (inglés y bikol partido) y no cubre otras variantes del bikol (como bikol central o bikol de Albay).
- No se dispone de información sobre la longitud máxima de secuencia soportada ni sobre el comportamiento con entradas fuera del dominio de entrenamiento.
- Al ser un modelo cuantizado q8, puede haber una degradación en la calidad de traducción comparada con una versión de precisión completa, aunque no se han publicado métricas que lo confirmen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/iamagelleift/bikol-partido-english-browser
- Transformers.js (biblioteca de ejecución): https://huggingface.co/docs/transformers.js
- ONNX Runtime Web: https://onnxruntime.ai/
- Polytranslator (servicio comercial de traducción bikol): https://www.polytranslator.com/bikol/
- Langlation (traducción bikol-inglés): https://langlation.com/paragraph-translation/bikol-to-english
- XlatorHub (traductor bikol-inglés): https://xlatorhub.com/translator-tool/bikol-to-english-translator/
- TranslatorMind (traductor bikol): https://translatormind.com/translator-tool/bikol-language-translator/
