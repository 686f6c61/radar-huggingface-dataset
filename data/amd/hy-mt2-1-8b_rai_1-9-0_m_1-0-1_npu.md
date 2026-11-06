# amd/Hy-MT2-1.8B_rai_1.9.0_m_1.0.1_npu

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática desarrollado por Tencent Hunyuan (la arquitectura interna se identifica como `hunyuan_v1_dense`) y empaquetado por AMD para su ejecución optimizada en hardware Ryzen AI con NPU. La versión publicada bajo el identificador `amd/Hy-MT2-1.8B_rai_1.9.0_m_1.0.1_npu` es una conversión a formato ONNX cuantizado con Quark, diseñada específicamente para el stack Ryzen AI (RAI 1.9.0) y el modelo de aceleración `m_1.0.1_npu`. Con 1.800 millones de parámetros y una arquitectura transformer densa, el modelo está orientado a tareas de traducción y generación de texto conversacional en inglés.

El interés de esta ficha radica en que no se trata de la publicación original de Tencent, sino de un artefacto de despliegue producido por AMD para llevar inferencia de modelos de lenguaje a PCs con NPU integrada (familia Ryzen AI). Esto lo convierte en un caso de estudio de cómo los fabricantes de silicio distribuyen pesos optimizados para su hardware, con las limitaciones de formato, licencia y acceso que ello implica. El repositorio está restringido (gated) y no registra descargas ni interacciones en el momento de la consulta.

La información pública disponible es escasa: los metadatos de Hugging Face no incluyen model card detallada, resultados de benchmarks ni especificaciones de entrenamiento. Por tanto, esta ficha distingue explícitamente entre lo que se puede afirmar a partir de los metadatos y lo que queda como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (`hunyuan_v1_dense`) |
| Parametros totales | 1.800 millones (1.8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizacion Quark para ONNX (niveles exactos no disponibles) |
| Idiomas soportados | Ingles (`en` segun metadatos) |
| Licencia | `other` (terminos personalizados, acceso restringido) |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos es `hunyuan_v1_dense`, lo que indica un transformer denso de la familia Hunyuan de Tencent, sin mezcla de expertos. Con 1.8B parametros, se situa en el rango de modelos pequenos optimizados para inferencia en dispositivo. El sufijo `Hy-MT2` sugiere una segunda generacion de un modelo de traduccion (MT, machine translation) de Hunyuan, aunque no se dispone de documentacion publica que confirme la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

El artefacto distribuido por AMD no contiene los pesos originales en safetensors, sino una conversion a ONNX cuantizada mediante Quark y empaquetada para el runtime Ryzen AI 1.9.0 con el modelo de aceleracion `m_1.0.1_npu`. Esta cadena de herramientas implica que el modelo ha sido grafo-optimizado y cuantizado para ejecutarse en la NPU integrada de los procesadores Ryzen AI, lo que condiciona tanto el rendimiento como la portabilidad. No se han publicado detalles sobre innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y traduccion automatica, segun la denominacion `Hy-MT2` del modelo.
- Generacion conversacional (tag `conversational` en los metadatos).
- Inferencia en dispositivo sobre NPU Ryzen AI mediante el runtime RAI 1.9.0.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: los metadatos solo declaran ingles (`en`); no se confirma soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Traduccion automatica en dispositivo: el modelo, orientado a traduccion (MT), puede ejecutarse localmente en un PC con NPU Ryzen AI para traducir texto sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistentes conversacionales locales: gracias a su tamano de 1.8B y su empaquetado para NPU, puede integrarse en aplicaciones de escritorio que requieran generacion de texto conversacional de baja latencia sin conexion.
- Procesamiento de texto en el borde (edge computing): despliegue en equipos Ryzen AI para tareas de resumen, reescritura o clasificacion de texto donde no se dispone de GPU dedicada.
- Prototipado de pipelines de traduccion: util para desarrolladores que quieran validar flujos de traduccion en hardware AMD antes de escalar a modelos mayores.
- Educacion e investigacion: como ejemplo de conversion ONNX + Quark para NPU, sirve para estudiar el proceso de despliegue de modelos Hunyuan en hardware Ryzen AI.
- Aplicaciones de accesibilidad: generacion de texto y traduccion en tiempo real en equipos personales con NPU, sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo esta empaquetado para NPU Ryzen AI, no para GPU, por lo que la metrica relevante es la memoria compartida del sistema y la NPU, no la VRAM.
- GPU recomendadas: no aplica; el artefacto esta orientado a NPU integrada en procesadores AMD Ryzen AI.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX con runtime RAI 1.9.0 y el modelo `m_1.0.1_npu` apuntan a ejecucion en NPU, no en GPU.
- Opciones de despliegue: runtime Ryzen AI (RAI 1.9.0) con el modelo de aceleracion `m_1.0.1_npu`; otros runtimes (vLLM, llama.cpp, Ollama, TGI) no estan confirmados para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-MT2-1.8B (este) | 1.8B | No disponible | ONNX (Ryzen AI) | `other` (gated) | Restringida |
| Modelos de traduccion de ~1-2B (genericos) | ~1-2B | No disponible | safetensors/GGUF | Variable | Publica en general |
| Modelos Hunyuan originales de Tencent | Variable | No disponible | safetensors | Variable | Publica en general |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas concretas. La comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Licencia `other`: los terminos no son estandar; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Idioma: los metadatos solo declaran ingles; el soporte de otros idiomas no esta confirmado.
- Formato propietario de despliegue: el artefacto esta empaquetado para Ryzen AI (ONNX + Quark + RAI 1.9.0), lo que limita su uso fuera de ese hardware y runtime.
- Sin model card detallada: no hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de robustez.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar casos de uso con entradas largas.
- Sin descargas ni interacciones registradas: no hay evidencia de comunidad ni de validacion externa del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Hy-MT2-1.8B_rai_1.9.0_m_1.0.1_npu
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
