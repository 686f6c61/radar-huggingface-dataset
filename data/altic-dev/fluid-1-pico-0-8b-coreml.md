# altic-dev/Fluid-1-Pico-0.8B-CoreML

## Resumen

Fluid-1 Pico es un modelo de lenguaje de 0.8 mil millones de parámetros desarrollado por ALTIC, presentado como un artefacto oficial de la compañía. Se distribuye en formato Core ML compilado (.mlmodelc) para su ejecución en dispositivos Apple, lo que sugiere un enfoque orientado a inferencia en el dispositivo (on-device). El modelo se basa en Qwen/Qwen3.5-0.8B, un modelo de la familia Qwen de Alibaba, y añade ajustes finos, conversión a Core ML y optimizaciones propias de ALTIC.

La relevancia de este modelo radica en su tamaño reducido (0.8B), que permite desplegarlo en entornos con recursos limitados, como teléfonos móviles o dispositivos edge, manteniendo capacidades de generación de texto. Sin embargo, la información pública disponible es muy limitada: no se especifican detalles de arquitectura, contexto, idiomas ni benchmarks. La licencia es no comercial y exige permiso escrito de ALTIC para uso comercial, redistribución o integración por terceros, lo que restringe su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Qwen/Qwen3.5-0.8B, presumiblemente transformer) |
| Parametros totales | 0.8 mil millones (segun el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato Core ML compilado) |
| Idiomas soportados | no disponible |
| Licencia | altic-non-commercial-with-apache-2.0-upstream (uso comercial requiere permiso escrito de ALTIC) |
| Formato de pesos | Core ML (.mlmodelc) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. Se sabe que parte de Qwen/Qwen3.5-0.8B como modelo base, que es un modelo de lenguaje de tipo transformer con 0.8 mil millones de parametros. ALTIC ha aplicado ajuste fino (fine-tuning), modificaciones de parametros, conversion del grafo a Core ML, optimizacion y empaquetado para su distribucion compilada. No se especifican los datos de entrenamiento, el numero de tokens procesados ni si se emplearon tecnicas como RLHF o DPO. Tampoco se mencionan innovaciones tecnicas especificas mas alla de la conversion a Core ML.

## Capacidades

No se han publicado capacidades detalladas en la informacion disponible. Dado que se trata de un modelo de lenguaje de 0.8B basado en Qwen, es razonable esperar generacion de texto, pero no hay confirmacion oficial sobre:

- Generacion de texto general
- Razonamiento o capacidades de codigo
- Soporte de tool calling o function calling
- Capacidades de agente o multi-step reasoning
- Capacidades multilingues
- Modos especiales (vision, audio, thinking mode)

Se recomienda consultar la documentacion de Qwen3.5-0.8B para inferir capacidades base, aunque la informacion no esta disponible en esta ficha.

## Casos de uso

Dada la falta de especificaciones, los casos de uso son hipoteticos y deben validarse con pruebas reales. Posibles aplicaciones:

- Inferencia en dispositivos iOS: al estar compilado en Core ML, puede integrarse en aplicaciones nativas de Apple para generar texto sin conexion, aprovechando el Neural Engine.
- Asistentes personales offline: un chatbot ligero que funcione completamente en el dispositivo, preservando la privacidad del usuario.
- Autocompletado de texto en aplicaciones de productividad: sugerencias de escritura en editores o clientes de correo.
- Clasificacion o etiquetado de texto simple: tareas de NLP basico en entornos con restricciones de recursos.
- Educacion y prototipado: experimentacion con modelos pequenos en entornos academicos o de investigacion no comercial.
- Traduccion o resumen de textos cortos: si el modelo base soporta estas tareas, aunque no esta confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

Al ser un modelo Core ML compilado, los requisitos se centran en dispositivos Apple:

- Compatible con dispositivos iPhone, iPad y Mac con chip Apple Silicon (A12 o posterior para Core ML con Neural Engine).
- El tamano del repositorio es de aproximadamente 1.0 GB, lo que indica que el modelo compilado puede ocupar entre 500 MB y 1 GB en disco, dependiendo de la cuantizacion interna.
- No se especifican requisitos de RAM ni VRAM, pero al ser un modelo de 0.8B, se espera que quepa en la memoria unificada de dispositivos modernos.
- Opciones de despliegue: integracion directa en apps iOS/macOS mediante Core ML; no se mencionan adaptadores como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa. El modelo base Qwen/Qwen3.5-0.8B no tiene ficha publica detallada en esta busqueda. Alternativas teoricas de tamano similar (0.5B-1B) incluyen modelos como TinyLlama, Phi-3-mini o Gemma-2-2B, pero no hay datos comparativos de rendimiento ni licencias equiparables. Se recomienda evaluar directamente el modelo en tareas concretas.

## Limitaciones y advertencias

- Licencia restrictiva: el uso comercial, la redistribucion, la reventa alojada o la integracion por terceros requieren permiso escrito previo de ALTIC. Esto limita seriamente su uso en entornos empresariales o productos comerciales.
- Tamano reducido: con 0.8B de parametros, es probable que el modelo presente limitaciones en tareas complejas de razonamiento, generacion de codigo o comprension profunda del lenguaje.
- Informacion insuficiente: no se han publicado detalles sobre sesgos, riesgos de alucinacion, idiomas soportados ni limites de contexto. Es necesario realizar pruebas exhaustivas antes de cualquier despliegue.
- Formato propietario: al estar compilado en Core ML, no es directamente utilizable con frameworks estandar como Transformers de HuggingFace, lo que dificulta su integracion en pipelines existentes.
- Fecha de creacion reciente (julio de 2026) y sin descargas ni likes: el modelo no ha sido validado por la comunidad, lo que aumenta la incertidumbre sobre su calidad y estabilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/altic-dev/Fluid-1-Pico-0.8B-CoreML
- Repositorio de archivos: https://huggingface.co/altic-dev/Fluid-1-Pico-0.8B-CoreML/tree/main
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Terminos de ALTIC (ALTIC-MODEL-TERMS.md): https://huggingface.co/altic-dev/Fluid-1-Pico-0.8B-CoreML/blob/main/ALTIC-MODEL-TERMS.md
