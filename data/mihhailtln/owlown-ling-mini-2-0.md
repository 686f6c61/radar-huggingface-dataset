# MihhailTLN/owlown-ling-mini-2.0

## Resumen

OwlOwn Ling-mini 2.0 es un empaquetado de pesos del modelo base inclusionAI/Ling-mini-2.0, un transformer de tipo mezcla de expertos (MoE) con 16.000 millones de parametros totales y 1.400 millones de parametros activos por token. Lo publica el usuario MihhailTLN en Hugging Face y no constituye un modelo nuevo: se trata de una cuantizacion a 4 bits en formato MLX, con tamano de grupo 64, pensada para ejecutarse integramente en un iPhone dentro de la aplicacion OwlOwn, sin conexion a internet.

El repositorio reorganiza los pesos del modelo original para que la aplicacion pueda leerlos directamente desde el almacenamiento flash del telefono. Los tensores que no pertenecen a los expertos enrutados se guardan en `nonexpert.safetensors`, mientras que los expertos enrutados se reparten en el directorio `pack/`. El resultado es un artefacto de 9,2 GB que la app descarga en el primer arranque cuando el usuario selecciona este modelo.

Su relevancia es practica: demuestra la viabilidad de ejecutar un MoE de 16.000 millones de parametros en hardware movil mediante cuantizacion agresiva y lectura bajo demanda de los expertos. No obstante, al ser un reempaquetado, las capacidades, el entrenamiento y las limitaciones reales son las del modelo base, y la documentacion disponible sobre este artefacto es minima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer, segun la etiqueta `bailing_moe` del repositorio |
| Parametros totales | 16 000 millones (16B) |
| Parametros activos | 1400 millones (1.4B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en formato MLX, tamano de grupo 64 |
| Idiomas soportados | Ingles (segun la model card del reempaquetado) |
| Licencia | MIT |
| Formato de pesos | safetensors (`nonexpert.safetensors` para tensores no expertos y `pack/` para expertos enrutados), optimizado para lectura directa desde flash en iOS |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base inclusionAI/Ling-mini-2.0, un transformer con capas de mezcla de expertos en el que solo se activa una fraccion reducida de los parametros por token: 1.400 millones de los 16.000 millones totales. La etiqueta `bailing_moe` del repositorio apunta a la familia de implementaciones MoE asociadas a Ling. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card del reempaquetado no los detalla y la busqueda web realizada no aporta datos tecnicos.

El trabajo de MihhailTLN se limita a la cuantizacion y el reempaquetado. Los pesos se convierten a 4 bits con MLX y tamano de grupo 64, y se separan fisicamente en dos estructuras: los tensores densos en un unico safetensors y los expertos enrutados en el directorio `pack/`, dispuestos byte a byte para lecturas directas desde el almacenamiento del telefono. Esta separacion permite cargar en memoria solo los expertos necesarios en cada paso de decodificacion, lo que reduce la presion sobre la RAM del dispositivo. El repositorio incluye ademas `reference.json`, un conjunto fijo de prompts de prueba con sus tokens de salida de referencia que la aplicacion usa para autodiagnostico.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Ling-mini-2.0.
- Razonamiento y respuesta a instrucciones, en la medida en que lo soporte el modelo base.
- Ejecucion local completa en iPhone sin conexion a internet, que es el objetivo declarado del empaquetado.
- Autoverificacion mediante `reference.json`, que permite a la app comprobar que la inferencia produce los tokens esperados.
- No hay informacion disponible sobre soporte de tool calling, function calling, capacidades de agente, modo de pensamiento, vision ni audio en la documentacion proporcionada.
- Capacidades multilingues: la model card declara unicamente ingles.

## Casos de uso

- Asistente conversacional offline en iPhone: la aplicacion OwlOwn descarga el repositorio en el primer arranque y ejecuta el modelo en el dispositivo, de modo que las conversaciones no salen del telefono y funcionan sin cobertura.
- Procesamiento de texto confidencial en movilidad: al no requerir red, el modelo es adecuado para redactar o resumir contenido sensible sin enviarlo a un servidor externo.
- Pruebas de humo de inferencia en iOS: `reference.json` permite a los desarrolladores de la app verificar que la cuantizacion MLX y la lectura de expertos desde flash producen resultados correctos tras cada actualizacion.
- Distribucion de modelos grandes en movil: el esquema de separar expertos en `pack/` sirve como referencia para otras apps que quieran servir modelos MoE de gran tamano mediante descarga bajo demanda.
- Evaluacion de MoE cuantizados en hardware de consumo: investigadores pueden medir latencia, consumo de memoria y calidad de un MoE de 16B con 1.4B activos en un telefono real.
- Prototipado de funciones de escritura y resumen dentro de una app nativa: el modelo puede integrarse como servicio local para tareas de texto acotadas, siempre que el rendimiento medido en el dispositivo sea aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual, ya que el destino es un iPhone. El repositorio ocupa 9,2 GB en almacenamiento, y la RAM necesaria en ejecucion depende de cuantos expertos se carguen simultaneamente; no se ha publicado una cifra concreta.
- GPU recomendadas: el formato es MLX, orientado a Apple Silicon; el destino declarado es iPhone. No hay datos sobre ejecucion en A100, H100 ni RTX 4090 con este empaquetado concreto.
- Compatibilidad con GPU de consumo: no disponible. El artefacto esta disenado para iOS, no para equipos de escritorio con CUDA.
- Opciones de despliegue: la aplicacion OwlOwn con la libreria MLX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI con estos pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| OwlOwn Ling-mini 2.0 (este) | 16B / 1.4B | no disponible | MIT | safetensors MLX 4 bits | Hugging Face, orientado a iOS |
| inclusionAI/Ling-mini-2.0 | 16B / 1.4B | no disponible | MIT | safetensors | Hugging Face, modelo base |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base, del que este repositorio es una cuantizacion. No se dispone de informacion sobre otros modelos comparables en la busqueda realizada.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo nuevo: cualquier defecto, sesgo o limitacion del modelo base se hereda intacto.
- La cuantizacion a 4 bits puede degradar la calidad respecto a los pesos originales en precision completa; no se han publicado evaluaciones de esa perdida.
- Idioma limitado al ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con conversaciones largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia MIT permite uso comercial, pero conviene revisar los terminos completos del modelo base inclusionAI/Ling-mini-2.0, a los que la model card remite.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo dia; no hay evidencia de uso en produccion.
- El formato MLX y la estructura `pack/` estan pensados para la app OwlOwn; reutilizarlos fuera de ese entorno requiere trabajo de adaptacion no documentado.
- La busqueda web realizada no aporto informacion tecnica relevante sobre el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MihhailTLN/owlown-ling-mini-2.0
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
