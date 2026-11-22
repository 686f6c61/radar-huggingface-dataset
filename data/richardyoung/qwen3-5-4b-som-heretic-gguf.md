# richardyoung/Qwen3.5-4B-SOM-heretic-GGUF

## Resumen

Qwen3.5-4B-SOM-heretic-GGUF es una cuantizacion en formato GGUF del modelo richardyoung/Qwen3.5-4B-SOM-heretic, un derivado del modelo Qwen3.5 de 4B parametros sometido a un proceso de "abliteration" (eliminacion de los mecanismos de rechazo aprendidos por alineamiento) mediante la tecnica heretic. El autor, richardyoung, publica esta version orientada a inferencia local con llama.cpp y Ollama, con pesos cuantizados mediante imatrix para preservar al maximo la calidad tras la compresion.

El modelo cuenta con 4.205.751.296 parametros totales segun los pesos en safetensors del modelo base, y esta pensado para generacion de texto conversacional en ingles. Su interes principal reside en que ofrece un modelo de 4B sin restricciones de contenido (uncensored/abliterated) en un formato listo para ejecutar en hardware de consumo, algo relevante para investigacion sobre alineamiento, red teaming y estudios de comportamiento de modelos.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face; no se han publicado detalles sobre la composicion del dataset de entrenamiento, la longitud de contexto efectiva ni resultados de benchmarks en la informacion proporcionada. El acceso al repositorio esta restringido (gated) y requiere aceptar las condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5; detalles especificos no disponibles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no listadas en la informacion; generadas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5 con 4.205.751.296 parametros. Sobre la base se aplico la tecnica heretic de abliteration, que identifica y neutraliza las direcciones del espacio de activaciones asociadas al rechazo de peticiones, produciendo un modelo "uncensored" que conserva en teoria las capacidades originales pero sin las negativas aprendidas durante el alineamiento. El autor publica ademas una version en safetensors (richardyoung/Qwen3.5-4B-SOM-heretic), de la que esta GGUF es la cuantizacion.

Las cuantizaciones GGUF se han generado con imatrix, un metodo de cuantizacion con importancia matricial que reduce la perdida de calidad respecto a la cuantizacion uniforme, especialmente en modelos pequenos donde cada bit cuenta. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones arquitectonicas adicionales mas alla de las heredadas de Qwen3.5.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Qwen3.5.
- Generacion de codigo y matematicas basicas (capacidad esperable del modelo base; sin datos especificos publicados).
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original rechazaria.
- Compatibilidad con llama.cpp, Ollama y endpoints compatibles con la API de OpenAI.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la abliteration afecta a la distribucion de respuestas y a la utilidad percibida, comparandolo con el Qwen3.5 original en el mismo hardware.
- Red teaming y evaluacion de salvaguardas: sirve como modelo "sin restricciones" de referencia para probar clasificadores de contenido y filtros de moderacion en pipelines propios.
- Inferencia local en hardware de consumo: al ser un GGUF de 4B, puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp u Ollama, util para prototipado offline.
- Generacion creativa sin filtros: escritura de ficcion, dialogos o guiones donde el autor necesita explorar tonos o temas que los modelos alineados suelen declinar.
- Experimentos de cuantizacion: las variantes GGUF con imatrix permiten comparar la degradacion de calidad entre niveles de cuantizacion sobre un mismo modelo base de 4B.
- Despliegue en entornos aislados: al ser pesos descargables y ejecutables localmente, encaja en laboratorios con requisitos de privacidad donde no se permite enviar datos a APIs externas.
- Docencia sobre modelos de lenguaje: permite mostrar de forma practica que es la abliteration y como se manifiesta en las respuestas, con un modelo lo bastante pequeno para correr en un aula.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de 4B en GGUF, las cuantizaciones de 4 bits suelen ocupar en torno a 2,5-3 GB y las de 8 bits en torno a 4,5-5 GB, mas el overhead del contexto (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con 6-8 GB de VRAM o mas deberia poder ejecutar las cuantizaciones de 4 bits.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas tipo RTX 3060, RTX 4060, RTX 4070 y superiores, asi como en Apple Silicon con memoria unificada suficiente (no confirmado en la informacion).
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con endpoints OpenAI (segun los tags del repositorio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen3.5-4B-SOM-heretic-GGUF | 4,2B | No disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, acceso gated |
| Qwen3.5-4B (original) | ~4B | No disponible | No disponible en esta ficha | Safetensors/GGUF | Alineado, con rechazos; referencia para comparar el efecto de la abliteration |
| richardyoung/Qwen3.5-4B-SOM-heretic | 4,2B | No disponible | Apache 2.0 | Safetensors | Version sin cuantizar del mismo modelo |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Modelo abliterated: no aplica las salvaguardas habituales de rechazo, por lo que puede generar contenido danino, ilegal o inexacto sin advertencia; no debe desplegarse en produccion orientada a usuarios finales sin filtros externos.
- Riesgo elevado de alucinacion, comun en modelos de 4B y potencialmente agravado por la perdida de calidad de la cuantizacion.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse la ventana del Qwen3.5 original sin verificacion.
- Licencia Apache 2.0 permite uso comercial, pero el acceso al repositorio esta restringido (gated) y sujeto a las condiciones de Hugging Face; el uso comercial del contenido generado es responsabilidad del usuario.
- Las cuantizaciones GGUF introducen degradacion respecto a los pesos originales; el nivel exacto depende de la variante elegida.
- Sin benchmarks publicados ni validacion independiente del efecto de la abliteration sobre las capacidades del modelo.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic-GGUF
- Modelo base sin cuantizar: https://huggingface.co/richardyoung/Qwen3.5-4B-SOM-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
