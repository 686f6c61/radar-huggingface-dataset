# mflux-community/fibo-1-5-mflux-bf16

## Resumen

Fibo-1.5 · MFlux BF16 es una conversion comunitaria a MLX del modelo de generacion de imagenes Fibo-1.5 de Bria (briaai/Fibo-1.5), publicada por la organizacion mflux-community. No es una version oficial: los pesos originales se han convertido a formato MLX (safetensors) sin modificar la arquitectura, con el objetivo de ejecutar el modelo de forma nativa en Macs con Apple Silicon a traves de MFlux, la implementacion open source de MLX para modelos generativos de imagen de Filip Strand.

El repositorio contiene los pesos en BF16 sin cuantizar (25,5 GB), lo que lo convierte en la referencia de mayor fidelidad de la familia. La misma organizacion publica variantes cuantizadas Q8, Q6, Q5, Q4 y Q3 con tamanos que van de 14,9 GB a 7,8 GB, de modo que el modelo puede ajustarse al presupuesto de memoria unificada disponible. Ademas, la CLI permite pasar --quantize para cuantizar en tiempo de ejecucion sin descargar otro repositorio.

La relevancia de esta ficha es practica: es la via para usar Fibo-1.5 en local sobre macOS sin depender de CUDA ni de servicios en la nube, algo util para prototipado, investigacion y flujos con requisitos de privacidad. Hay que tener en cuenta dos condicionantes importantes: la licencia heredada del modelo original es bria-fibo con enlace a CC BY-NC 4.0 (uso no comercial) y el repositorio no tiene descargas ni valoraciones registradas en el momento de redactar esta ficha, por lo que carece de validacion independiente de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusion text-to-image; el autor de la conversion no detalla la arquitectura interna) |
| Parametros totales | No disponible (el repo BF16 ocupa 25,5 GB) |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No aplica (la entrada es un prompt de texto, no una secuencia de tokens de contexto largo); valor no disponible |
| Tipos de cuantizacion | BF16 (este repo, sin cuantizar); Q8 (14,9 GB), Q6 (12,0 GB), Q5 (10,6 GB), Q4 (9,2 GB) y Q3 (7,8 GB) en repos separados; cuantizacion en tiempo de ejecucion con --quantize |
| Idiomas soportados | No disponible |
| Licencia | bria-fibo, con enlace a CC BY-NC 4.0 (uso no comercial) |
| Formato de pesos | safetensors en formato MLX |
| Libreria | mflux |
| Modelo base | briaai/Fibo-1.5 (relacion: quantized) |
| Tarea | text-to-image |
| Tamano del repositorio | 25,5 GB |
| Fecha de conversion | 2026-10-08 |

## Arquitectura y entrenamiento

Esta ficha describe una conversion, no un entrenamiento. Los pesos proceden de briaai/Fibo-1.5 y la unica intervencion documentada por mflux-community es la conversion al formato MLX; no se ha reentrenado, destilado ni ajustado el modelo. La model card indica explicitamente que los pesos "fueron modificados del release original unicamente por conversion a MLX", y que la licencia del modelo original se mantiene sin cambios. La informacion proporcionada no incluye detalles sobre la arquitectura interna de Fibo-1.5 (tipo de backbone de difusion, numero de parametros, tamano del dataset de entrenamiento, numero de tokens, composicion de los datos ni si hubo fases de RLHF o DPO).

Lo unico verificable tecnicamente es el formato de despliegue: pesos en BF16 (2 bytes por parametro) dentro del ecosistema MLX, que ejecuta operaciones sobre la GPU integrada y la memoria unificada de los chips de Apple mediante grafos diferidos. La familia incluye variantes cuantizadas a 8, 6, 5, 4 y 3 bits, lo que sugiere que la conversion se ha validado al menos a nivel de empaquetado en varios niveles de precision, aunque no se publican metricas de degradacion por cuantizacion.

## Capacidades

- Generacion de imagenes a partir de un prompt de texto (pipeline text-to-image), con control de resolucion mediante los parametros de anchura y altura de la CLI (el ejemplo de la model card usa 1024x1024).
- Ejecucion completamente local en Apple Silicon mediante MLX, sin llamadas a APIs externas ni envio de prompts a servidores de terceros.
- Reproducibilidad mediante semilla fija (--seed), util para comparar variantes de cuantizacion o iterar prompts.
- Seleccion de modelo por repositorio o por ruta local, lo que permite trabajar sin conexion una vez descargados los pesos.
- Cuantizacion en tiempo de ejecucion (--quantize) sobre los pesos BF16, sin necesidad de descargar una variante cuantizada.
- Ajuste del modelo base mediante el parametro --base-model fibo.
- No se documentan capacidades de tool calling, function calling, uso agentico, vision de entrada, audio ni modo de razonamiento. No es un modelo de lenguaje: no genera texto ni codigo.
- No se documenta soporte multilingue explicito para los prompts.

## Casos de uso

- Prototipado de conceptos visuales en local: un disenador puede generar variaciones de una idea (por ejemplo, "A puffin standing on a cliff") sin subir el prompt a un servicio externo, gracias a que la inferencia ocurre integramente en el Mac.
- Flujos con requisitos de confidencialidad: equipos que no pueden enviar descripciones de producto o material interno a APIs de terceros pueden generar imagenes en la maquina del propio usuario con los pesos BF16 o una variante cuantizada.
- Investigacion sobre modelos de difusion: los pesos BF16 sirven como referencia de alta fidelidad para comparar el efecto de la cuantizacion (Q8 frente a Q4, por ejemplo) sobre la calidad de salida en una misma semilla.
- Generacion de recursos para prototipos de interfaz o presentaciones internas: ilustraciones de relleno, mockups y material de apoyo en documentos tecnicos, siempre dentro del marco no comercial de la licencia.
- Experimentacion con pipelines de generacion de imagen en macOS: evaluar el rendimiento y la ergonomia de MFlux frente a stacks basados en CUDA, incluida la carga de modelos por ruta local con hf download.
- Docencia y talleres: al requerir solo un Mac con Apple Silicon y el comando uv tool install mflux, es un punto de entrada sencillo para explicar como funciona la inferencia de un modelo de difusion en hardware de consumo.
- Ajuste de la relacion calidad/memoria en un mismo equipo: elegir entre BF16 (25,5 GB), Q8 (14,9 GB) o Q4 (9,2 GB) segun la memoria unificada disponible para un mismo flujo de trabajo.
- Uso comercial: no permitido por la licencia del modelo original (CC BY-NC 4.0); cualquier escenario de produccion con fines de lucro queda fuera de los casos de uso validos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas objetivas (FID, CLIP score, comparativas HumanEval/MMLU/GSM8K no aplicables al ser un modelo text-to-image) ni datos de latencia o throughput. Tampoco se documenta la degradacion de calidad esperada al pasar de BF16 a las variantes Q8, Q6, Q5, Q4 o Q3.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon (chips de la familia M). MLX no se ejecuta sobre GPU NVIDIA o AMD, por lo que CUDA y ROCm quedan fuera.
- Memoria unificada para BF16: el repositorio pesa 25,5 GB, por lo que se necesita un Mac con al menos 32 GB de memoria unificada para cargarlo con margen; 64 GB es la configuracion recomendada para trabajar con comodidad a resoluciones altas.
- Alternativas segun memoria disponible, usando los repos de la propia familia: Q8 (14,9 GB), Q6 (12,0 GB), Q5 (10,6 GB), Q4 (9,2 GB) y Q3 (7,8 GB). Los equipos con 16 GB de memoria unificada deberian apuntar a Q4 o Q3; con 24 GB, a Q5 o Q6.
- VRAM: no aplica en el sentido tradicional, ya que MLX usa memoria unificada compartida entre CPU y GPU.
- Opciones de despliegue: la CLI de MFlux (mflux-generate-fibo con los parametros --model, --base-model, --prompt, --width, --height, --seed, --output), instalada con uv tool install mflux. Tambien se puede descargar el repositorio completo con hf download y pasar una ruta local en --model.
- Servidores de inferencia para GPU (vLLM, TGI) y runtimes de CPU/GPU genericos (llama.cpp, Ollama): no soportados por este repositorio, que es especifico de MLX.
- Latencia y throughput: no disponible. No se publican tiempos por imagen ni imagenes por segundo en la informacion proporcionada.
- Almacenamiento: 25,5 GB para BF16, mas el espacio temporal necesario durante la descarga; las variantes cuantizadas reducen este requisito hasta los 7,8 GB de Q3.

## Comparativa con modelos similares

No se dispone de datos de rendimiento (benchmarks, latencia, calidad percibida) que permitan comparar esta conversion con otros modelos text-to-image como SDXL, FLUX.1 o el propio Fibo-1.5 en su distribucion original, por lo que la comparativa de rendimiento es "no disponible". Si es posible comparar las variantes de la propia familia en terminos de formato y tamano:

| Repositorio | Precision | Tamano | Plataforma | Licencia |
|---|---|---|---|---|
| mflux-community/fibo-1-5-mflux-bf16 (este) | BF16 | 25,5 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| mflux-community/fibo-1-5-mflux-q8 | Q8 | 14,9 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| mflux-community/fibo-1-5-mflux-q6 | Q6 | 12,0 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| mflux-community/fibo-1-5-mflux-q5 | Q5 | 10,6 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| mflux-community/fibo-1-5-mflux-q4 | Q4 | 9,2 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| mflux-community/fibo-1-5-mflux-q3 | Q3 | 7,8 GB | Apple Silicon (MLX) | bria-fibo (CC BY-NC 4.0) |
| briaai/Fibo-1.5 (original) | No disponible | No disponible | Multiplataforma (formato original) | bria-fibo (CC BY-NC 4.0) |

Frente a alternativas de otros autores, los datos de parametros, contexto y rendimiento no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no comercial: el repositorio hereda la licencia bria-fibo y enlaza a CC BY-NC 4.0. Esto excluye el uso comercial. Cualquier despliegue en produccion con fines de lucro requiere negociar una licencia con Bria a partir del modelo original.
- Conversion no oficial: realizada por mflux-community, no por los autores de Fibo-1.5. La model card lo advierte de forma explicita; no hay validacion por parte de Bria ni garantia de equivalencia funcional con los pesos originales.
- Ausencia de validacion de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha, con creacion y ultima actualizacion el mismo dia (2026-10-09) y conversion el 2026-10-08. No hay evidencia publica de que los pesos hayan sido probados por terceros.
- Sin datos de calidad: no se publican benchmarks, ni metricas de degradacion por cuantizacion, ni comparativas con la version original. No se puede afirmar que BF16 reproduzca exactamente la salida del modelo de Bria.
- Alucinacion y artefactos: al ser un modelo de difusion generativa, puede producir artefactos visuales, anatomia incorrecta o elementos incoherentes con el prompt. No hay informacion sobre tasas de fallo.
- Sesgos: no se documenta la composicion del dataset de entrenamiento original ni evaluaciones de sesgo demografico, de modo que se desconoce el alcance de los sesgos heredados.
- Idiomas: no se declaran idiomas soportados para el prompt; el comportamiento con prompts en castellano no esta documentado.
- Restriccion de plataforma: requiere Apple Silicon. No hay soporte CUDA ni despliegue en servidores con GPU NVIDIA, lo que limita su uso en infraestructura de produccion convencional.
- Requisitos de memoria: los 25,5 GB de BF16 hacen que la variante sin cuantizar no sea viable en Macs con 16 GB de memoria unificada.
- Ausencia de funciones de lenguaje: no soporta tool calling, agentes, ni generacion de texto, por lo que no debe evaluarse como un LLM.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/mflux-community/fibo-1-5-mflux-bf16
- Modelo base original: https://huggingface.co/briaai/Fibo-1.5
- Variante Q8: https://huggingface.co/mflux-community/fibo-1-5-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/fibo-1-5-mflux-q6
- Variante Q5: https://huggingface.co/mflux-community/fibo-1-5-mflux-q5
- Variante Q4: https://huggingface.co/mflux-community/fibo-1-5-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-1-5-mflux-q3
- Organizacion MFlux-Community: https://huggingface.co/mflux-community
- Repositorio de MFlux: https://github.com/filipstrand/mflux
- Licencia bria-fibo (CC BY-NC 4.0): https://creativecommons.org/licenses/by-nc/4.0/deed.en
