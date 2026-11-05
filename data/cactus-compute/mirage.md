# Cactus-Compute/mirage

## Resumen

Mirage es un checkpoint de modelo distribuido por Cactus-Compute bajo el identificador `Cactus-Compute/mirage`. Se trata de un artefacto de entrenamiento seleccionado en el paso 1.100.000, empaquetado en un unico fichero `mirage_step_1100000.pkl` de 649.020.345 bytes (aproximadamente 619 MiB) con hash SHA-256 publicado. El repositorio ocupa 0,9 GB y contiene exclusivamente el checkpoint; los binarios del motor de inferencia se distribuyen por separado, segun indica la propia model card.

La informacion publica disponible es extremadamente limitada: no se declara arquitectura, numero de parametros, longitud de contexto, idiomas, licencia ni pipeline de HuggingFace. El checkpoint se copia sin modificaciones desde el repositorio `Cactus-Compute/mirage-research` en la revision `ec612a9228e6b68a42d7493461505610f1bc79cf`, donde reside el historial completo de entrenamiento. El formato `.pkl` (pickle de Python) sugiere un volcado de pesos y estado de optimizador propio de un framework de investigacion, no un formato de distribucion estandar como safetensors o GGUF.

Por tanto, esta ficha documenta lo que se puede verificar y marca explicitamente como "no disponible" todo aquello que el autor no ha publicado. Cualquier evaluacion de capacidades, rendimiento o idoneidad para produccion requeriria inspeccionar el checkpoint y el repositorio de investigacion asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el fichero de checkpoint pesa 649.020.345 bytes) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pkl` (pickle de Python), fichero `mirage_step_1100000.pkl` |
| Paso de entrenamiento | 1.100.000 |
| SHA-256 del checkpoint | `dc8db0c4f1a9f516a9080224514de7b6b85193a8c6648a35b0f0486c5bc25224` |
| Repositorio de origen | `Cactus-Compute/mirage-research`, revision `ec612a9228e6b68a42d7493461505610f1bc79cf` |
| Tamano del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM o hibrida), el numero de parametros, la composicion del dataset de entrenamiento ni las tecnicas de alineacion empleadas (RLHF, DPO u otras). La unica informacion verificable es el paso de entrenamiento del checkpoint seleccionado (1.100.000) y la existencia de un historial completo de checkpoints en el repositorio `Cactus-Compute/mirage-research`.

El uso de un fichero `.pkl` como artefacto de distribucion es indicativo de un pipeline de investigacion basado en serializacion de objetos de Python, habitual en frameworks de entrenamiento experimentales. El autor indica que los binarios del motor de inferencia se distribuyen por separado, lo que sugiere un ecosistema de ejecucion propio (probablemente vinculado a la linea de trabajo de Cactus Compute en inferencia en dispositivo) en lugar de un formato compatible directamente con vLLM, llama.cpp o TGI.

## Capacidades

- No se han documentado capacidades especificas en la informacion disponible.
- No hay confirmacion de soporte de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay confirmacion de soporte de tool calling ni function calling.
- No hay confirmacion de capacidades de agente o razonamiento multi-paso.
- No hay confirmacion de cobertura multilingue.
- No hay confirmacion de modos especiales (thinking mode, vision, audio).

## Casos de uso

No es posible enumerar casos de uso concretos y realistas sin conocer las capacidades, la modalidad de entrada/salida y la licencia del modelo. Los unicos escenarios que se pueden describir con rigor son de caracter metodologico:

- Reproduccion de investigacion: descargar el checkpoint `mirage_step_1100000.pkl`, verificar su SHA-256 y cargarlo con el motor que Cactus-Compute distribuye por separado para inspeccionar pesos y comportamiento en el paso 1.100.000.
- Auditoria de artefactos de entrenamiento: comparar este checkpoint con versiones anteriores del historial en `Cactus-Compute/mirage-research` para estudiar la evolucion del entrenamiento.
- Trazabilidad de linaje de modelos: usar los metadatos de revision y hash para documentar la procedencia del modelo en un registro interno de artefactos.
- Evaluacion interna previa a adopcion: ejecutar baterias de evaluacion propias una vez identificado el motor de inferencia compatible, dado que no hay benchmarks publicados.
- Analisis de formato de serializacion: estudiar el volcado `.pkl` para entender la estructura de pesos y estado que produce el pipeline de Cactus-Compute.
- Integracion en un entorno de investigacion cerrado: desplegar el checkpoint exclusivamente en el motor oficial, a la espera de que se publique la licencia que determine si el uso comercial es posible.

Cualquier caso de uso productivo (atencion al cliente, generacion de codigo, RAG, agentes) queda fuera de lo documentable hasta que el autor publique especificaciones y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 649.020.345 bytes en disco; el consumo en memoria depende de la arquitectura, el numero de parametros y el estado incluido en el `.pkl` (pesos, optimizador o ambos), datos no publicados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El autor indica que los binarios del motor se distribuyen por separado, por lo que el despliegue previsible pasa por ese motor propietario.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa rigurosa sin conocer el numero de parametros, la arquitectura, la licencia y las capacidades del modelo. Los unicos puntos de referencia objetivos son los metadatos del artefacto:

| Aspecto | Mirage (step 1.100.000) | Alternativas comparables |
|---|---|---|
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Formato de pesos | `.pkl` | safetensors/GGUF en la mayoria de modelos abiertos |
| Benchmarks publicados | ninguno | no disponible |
| Motor de inferencia | binarios separados del autor | vLLM, llama.cpp, TGI, etc. |

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se declaran arquitectura, parametros, contexto, idiomas ni datos de entrenamiento.
- Licencia no especificada: no se puede asumir permiso de uso comercial, modificacion ni redistribucion. Tratar el modelo como no licenciado para produccion hasta que el autor lo aclare.
- Formato `.pkl`: pickle es un formato de serializacion que puede ejecutar codigo arbitrario al deserializarse. Cargar el fichero solo en entornos aislados y verificando el SHA-256 publicado.
- Sin benchmarks ni evaluaciones independientes: no hay evidencia publica de calidad, sesgos o tasas de alucinacion.
- Sin informacion sobre sesgos: al desconocer el dataset de entrenamiento, no se puede evaluar el sesgo demografico, linguistico o cultural.
- Dependencia de un motor propietario: la imposibilidad de usar toolchains estandar (vLLM, llama.cpp) limita la portabilidad y el despliegue en infraestructura propia.
- Cero descargas y cero likes en el momento de la consulta: no hay senales de adopcion ni de validacion por parte de la comunidad.
- Riesgo de que el checkpoint incluya estado de optimizador, lo que inflaria el requisito de memoria respecto a los pesos puros; no verificable sin inspeccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Cactus-Compute/mirage
- Repositorio de investigacion con el historial de checkpoints: https://huggingface.co/Cactus-Compute/mirage-research
- Revision de origen del checkpoint: https://huggingface.co/Cactus-Compute/mirage-research/blob/ec612a9228e6b68a42d7493461505610f1bc79cf/mirage/mirage_step_1100000.pkl
- Organizacion en HuggingFace: https://huggingface.co/Cactus-Compute
