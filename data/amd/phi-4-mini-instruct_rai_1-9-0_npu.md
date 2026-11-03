# amd/Phi-4-mini-instruct_rai_1.9.0_npu

## Resumen

Phi-4-mini-instruct_rai_1.9.0_npu es una distribucion optimizada del modelo Phi-4-mini-instruct de Microsoft, publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El modelo base pertenece a la familia Phi-4 de modelos de lenguaje compactos, disenados para ofrecer razonamiento de calidad en un tamano reducido que pueda ejecutarse en hardware de consumo. Esta version concreta no es un modelo nuevo, sino una conversion a formato ONNX con cuantizacion Quark y codigo personalizado para aprovechar el motor de inferencia Ryzen AI 1.9.0.

El interes de esta publicacion reside en que acerca la inferencia local de un modelo de clase 4B a los PC con procesadores AMD Ryzen AI, permitiendo ejecutar tareas de generacion de texto y conversacion sin depender de GPU dedicada ni de la nube. El repositorio ocupa 5,7 GB y esta sujeto a acceso restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de descargarlo.

La informacion publica disponible es limitada: la model card de esta distribucion no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Los datos que se ofrecen a continuacion sobre el modelo base proceden del conocimiento general de la familia Phi-4-mini y deben contrastarse con la documentacion oficial de Microsoft antes de usarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-4-mini; etiqueta `phi3` en el repo) |
| Parametros totales | no disponible en la informacion proporcionada (el modelo base Phi-4-mini-instruct tiene aproximadamente 3.800 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | cuantizacion Quark para NPU (precision exacta no disponible) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | ONNX con codigo personalizado (`custom_code`), optimizado para Ryzen AI 1.9.0 |

## Arquitectura y entrenamiento

El repositorio es una conversion del modelo Phi-4-mini-instruct de Microsoft a ONNX, empaquetada con el runtime Ryzen AI 1.9.0 y cuantizada mediante Quark, el toolkit de cuantizacion de AMD. La etiqueta `phi3` indica que la implementacion reutiliza la clase arquitectonica Phi-3/Phi-4-mini dentro de ONNX Runtime, con codigo personalizado que debe cargarse con `trust_remote_code=True`. No se dispone de informacion sobre el proceso de calibracion de la cuantizacion ni sobre la perdida de precision respecto al modelo original.

Sobre el entrenamiento del modelo base no hay datos en la informacion proporcionada. Se sabe, por conocimiento general de la familia Phi-4-mini, que Microsoft entreno el modelo con un corpus centrado en datos de alta calidad (texto filtrado, datos sinteticos y datos de razonamiento), con fases de ajuste supervisado y preferencias, pero estos detalles no aparecen en la model card de esta distribucion y no deben atribuirse a ella sin verificacion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento basico y resolución de problemas de complejidad media (heredado del modelo base).
- Generacion de codigo y matematicas a nivel de modelo compacto.
- Soporte de tool calling y function calling (segun las capacidades del modelo base; no verificado en esta conversion ONNX).
- Capacidad de seguir instrucciones y mantener rol de sistema.
- Inferencia acelerada en NPU Ryzen AI mediante el runtime propietario de AMD.
- No incluye vision ni audio en esta distribucion.
- Capacidades multilingues limitadas al ingles segun los metadatos del repo.

## Casos de uso

- Asistentes locales en portatiles con Ryzen AI: el modelo se ejecuta sobre la NPU integrada, liberando CPU y GPU y reduciendo el consumo energetico en aplicaciones de escritorio con asistente conversacional.
- Procesamiento de texto offline en entornos sin conectividad: al ser una distribucion local, permite resumir, clasificar o reescribir documentos sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Automatizacion de tareas de oficina: generacion de borradores de correos, resumenes de reuniones y extraccion de acciones a partir de transcripciones, aprovechando la ventana de contexto del modelo base.
- Copiloto de codigo ligero en IDE: autocompletado y explicacion de fragmentos en ingles, con latencia aceptable al ejecutarse en NPU sin competir por la GPU.
- Clasificacion y etiquetado de texto a granel: procesamiento por lotes de tickets, resenas o formularios en pipelines locales, donde el coste por token en hardware propio es marginal.
- Prototipado de agentes con tool calling: integracion en flujos que requieren llamadas a funciones (calendario, busqueda local, APIs internas) en un entorno de escritorio controlado.
- Educacion y demos de IA en hardware AMD: permite mostrar inferencia de un LLM en NPU en ferias, aulas o entornos de desarrollo sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribucion no incluye metricas de calidad, latencia ni throughput. Cualquier cifra de rendimiento del modelo base (MMLU, GSM8K, HumanEval) debe consultarse en la documentacion oficial de Microsoft para Phi-4-mini-instruct, no en este repositorio.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI con soporte para el runtime Ryzen AI 1.9.0 (familias Strix Point y posteriores, segun la documentacion de AMD).
- VRAM: no aplica en el sentido tradicional; el modelo se ejecuta en la NPU y en memoria del sistema. El repo ocupa 5,7 GB en disco.
- GPU dedicada: no necesaria para el camino optimizado; el modelo esta pensado para la NPU.
- Memoria del sistema: se recomienda al menos 16 GB de RAM para cargar el modelo y el runtime con holgura (estimacion, no dato oficial).
- Despliegue: ONNX Runtime con el proveedor de ejecucion Ryzen AI; no es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Phi-4-mini-instruct_rai_1.9.0_npu (este) | no disponible (~3,8B en el base) | no disponible (128k en el base) | MIT | ONNX / NPU Ryzen AI | Distribucion AMD, solo ingles |
| Phi-4-mini-instruct (Microsoft) | ~3,8B | 128k | MIT | Safetensors, GGUF | Modelo base original, multiplataforma |
| Llama 3.2 3B Instruct | ~3,2B | 128k | Llama 3.2 Community License | Safetensors, GGUF | Alternativa compacta, licencia con restricciones |
| Qwen2.5 3B Instruct | ~3,1B | 32k | Apache 2.0 | Safetensors, GGUF | Multilingue, contexto menor |

La comparativa se basa en caracteristicas generales de los modelos citados; los datos de esta distribucion concreta (parametros, contexto) no estan confirmados en la informacion proporcionada.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace antes de la descarga.
- Solo ingles: los metadatos declaran unicamente el idioma `en`; no se garantiza calidad en castellano ni en otros idiomas.
- Dependencia de hardware: el modelo solo funciona con el runtime Ryzen AI 1.9.0 y NPU compatibles; no es portable a otras plataformas sin reconversion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje compactos; especialmente en tareas de razonamiento largo o datos factuales.
- Perdida por cuantizacion: la conversion a Quark para NPU puede degradar la precision respecto al modelo original; no se documenta la magnitud de esa perdida.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de usarlo en produccion.
- Sesgos: no documentados en esta distribucion; se heredan los del modelo base de Microsoft.
- Licencia MIT: permisiva para uso comercial, pero conviene revisar los terminos del modelo base y del runtime Ryzen AI, que pueden tener condiciones adicionales.
- Sin benchmarks publicados: no hay evidencia en el repo de que la calidad se mantenga tras la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Phi-4-mini-instruct_rai_1.9.0_npu
- Modelo base (Microsoft): https://huggingface.co/microsoft/Phi-4-mini-instruct
- Documentacion de Ryzen AI: https://ryzenai.docs.amd.com/
- Toolkit Quark de AMD: https://quark.docs.amd.com/
