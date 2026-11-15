# NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE-GGUF

## Resumen

Qwen3.5-0.8B-HTML-SoftMoE-GGUF es una cuantizacion en formato GGUF (Q8_0) del modelo Qwen3.5-0.8B-HTML-SoftMoE, publicado por el usuario NikitaLazarev. Se trata de un piloto experimental de un "experto" Soft MoE orientado a la generacion de HTML segun las especificaciones de WHATWG y MDN. El modelo parte de una base Qwen3.5 de 0.8B parametros y le aplica un ajuste de dominio (steer patch) que queda integrado directamente en los pesos.

La relevancia de esta publicacion es fundamentalmente tecnica y experimental: demuestra el flujo completo de creacion de un experto de dominio mediante weight steering sobre un modelo pequeno y su posterior conversion a GGUF con llama.cpp. El resultado es un artefacto que se puede ejecutar en llama.cpp, LM Studio u Ollama sin necesidad de soporte especial en el runtime, lo que simplifica el despliegue en entornos locales.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no ha publicado informacion sobre licencia, idiomas soportados ni pipeline. Los parametros totales reales, segun los safetensors, son 772.845.888 (aproximadamente 0.77B), y el tamano del repositorio es de 0.8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Soft MoE sobre base transformer Qwen3.5 (detalles no disponibles) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card indica que se trata de una cuantizacion Q8_0 de un experto Soft MoE de dominio ("HTML authoring (WHATWG/MDN)") construido sobre Qwen3.5-0.8B. La tecnica empleada es weight steering: un "steer patch" de dominio que se aplica e integra en los pesos del modelo base. El resultado se convierte a GGUF mediante `convert_hf_to_gguf.py` de llama.cpp, de modo que el ajuste de dominio viaja dentro del propio fichero GGUF y no requiere un runtime modificado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. Tampoco se detalla la arquitectura interna del componente Soft MoE (numero de expertos, mecanismo de enrutamiento, capas afectadas). El modelo fue creado con Ivanna Lab, un laboratorio de modelos LLM autoalojado.

## Capacidades

- Generacion de HTML conforme a las especificaciones WHATWG y MDN, que es el dominio objetivo del ajuste.
- Conversacion multi-turno (etiqueta "conversational" en el repo).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Ejecucion local en llama.cpp, LM Studio y Ollama sin soporte especial de runtime.
- Capacidades de razonamiento, codigo general, matematicas, vision, audio, tool calling o agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de plantillas HTML: el modelo puede producir estructuras HTML semanticas alineadas con WHATWG/MDN, util para prototipado rapido de maquetas y componentes.
- Asistente de documentacion web: integrado en un editor o wiki, puede redactar fragmentos HTML de ejemplo para guias y articulos tecnicos.
- Correccion de marcado en pipelines de validacion: dado un fragmento HTML, el modelo puede reescribirlo para ajustarlo a las practicas recomendadas por MDN.
- Entornos de desarrollo con recursos limitados: al ser un modelo de 0.77B en Q8_0 y ocupar 0.8 GB, cabe en portatiles y estaciones de trabajo sin GPU dedicada, lo que permite probar asistentes de HTML en local.
- Prototipado de agentes de generacion de interfaz: sirve como componente de generacion de HTML dentro de un pipeline mayor, siempre que se valide la salida con un validador externo.
- Experimentacion con weight steering: util como caso de estudio reproducible para investigadores que quieran replicar el flujo de creacion de expertos de dominio y su conversion a GGUF.
- Educacion y demos: por su tamano reducido, es adecuado para demostraciones de generacion de HTML en talleres y cursos sin infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0.8-1.0 GB para inferencia en Q8_0, dado el tamano del repositorio (0.8 GB) y el numero de parametros (772.845.888).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna (GTX 1050 en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (segun la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-HTML-SoftMoE-GGUF | 772.845.888 | no disponible | Q8_0 | no disponible | Hugging Face |
| Qwen3.5-0.8B-HTML-SoftMoE | no disponible | no disponible | safetensors (presumible) | no disponible | Hugging Face |
| Modelos comparables de 0.5-1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si se permite el uso comercial; conviene contactar con el autor antes de usarlo en produccion.
- Es un piloto experimental ("e2e pilot") con 0 descargas y 0 likes; no hay evidencia de validacion por parte de la comunidad.
- El ajuste de dominio se limita a HTML (WHATWG/MDN); fuera de ese ambito el comportamiento puede degradarse respecto al modelo base.
- No se han publicado evaluaciones de sesgo, alucinacion ni robustez.
- El riesgo de alucinacion en la generacion de HTML es relevante: la salida debe validarse siempre con herramientas como el validador del W3C.
- No se especifican los idiomas soportados; el modelo base Qwen3.5 tiene cobertura multilingue, pero el ajuste de dominio puede haberla alterado.
- Al ser una cuantizacion Q8_0, puede haber una ligera perdida de calidad frente a los pesos originales en safetensors.
- La informacion sobre contexto maximo y arquitectura interna es insuficiente para garantizar un uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE-GGUF
- Modelo base: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE
- Ivanna Lab (herramienta de creacion): https://github.com/wiskeone/ivanna-lab
- llama.cpp (conversion y runtime): https://github.com/ggerganov/llama.cpp
