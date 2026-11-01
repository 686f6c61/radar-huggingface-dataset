# mflux-community/fibo-2-0-edit-turbo-mflux-q5

## Resumen

Fibo-2.0-Edit-Turbo · MFlux Q5 es una conversión comunitaria del modelo de generación y edición de imágenes briaai/Fibo-2.0-edit-turbo, adaptada para ejecutarse localmente en Apple Silicon mediante MLX. La conversión la mantiene el colectivo MFlux-Community, no los autores originales del modelo, y se distribuye únicamente como pesos cuantizados en formato MLX con cuantización afín de 5 bits aplicada al text encoder, al transformer y al VAE.

El objetivo del repositorio es hacer viable la inferencia local de un modelo de difusión de gran tamaño en equipos Mac con memoria unificada, reduciendo el peso de los pesos originales (25,1 GB en BF16) hasta 8,8 GB en esta variante Q5. La cuantización está almacenada en los propios pesos, de modo que no es necesario pasar ningún flag de cuantización al ejecutar la generación.

No se dispone de información sobre la arquitectura interna del modelo base, el número de parámetros, la longitud de contexto textual ni los datos de entrenamiento en la documentación proporcionada. La ficha se limita, por tanto, a documentar lo que el repositorio declara explícitamente: el pipeline text-to-image, la librería MFlux, la licencia heredada y las opciones de cuantización disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para texto-a-imagen y edición; detalles internos no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 5-bit (Q5); el repositorio ofrece además BF16, Q8, Q6, Q4 y Q3 en repos separados |
| Idiomas soportados | no disponible |
| Licencia | fibo-2.0-edit-turbo-license (heredada de briaai/Fibo-2.0-edit-turbo; términos en la model card original) |
| Formato de pesos | safetensors en MLX (librería mflux) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base. La model card de esta conversión describe únicamente el proceso de adaptación: los pesos originales de briaai/Fibo-2.0-edit-turbo se convirtieron a MLX con la versión 0.23.0 de MFlux el 25 de octubre de 2026, aplicando cuantización afín de 5 bits sobre el text encoder, el transformer y el VAE. El nivel de cuantización queda grabado en los pesos, por lo que la herramienta de generación lo detecta automáticamente sin necesidad de indicar `--quantize`.

No se especifican en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas del modelo original más allá de su naturaleza de modelo de difusión para generación y edición de imágenes con variante "turbo", que en la nomenclatura habitual de modelos de difusión suele implicar menos pasos de muestreo, aunque este extremo no se confirma en la información disponible.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Edición de imágenes, según indica el nombre del modelo base (`edit-turbo`); los detalles concretos del modo de edición no se documentan en la información disponible.
- Ejecución local nativa en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Control de resolución de salida mediante parámetros de anchura y altura (el ejemplo de la model card usa 1024x1024).
- Reproducibilidad mediante semilla (`--seed`).
- Elección entre distintos niveles de cuantización (BF16, Q8, Q6, Q5, Q4, Q3) según el equilibrio deseado entre calidad y uso de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo explícito ni modos de "thinking".

## Casos de uso

- Prototipado local de generación de imágenes en Mac: desarrolladores que quieran iterar sobre prompts sin coste de API pueden ejecutar el modelo con `mflux-generate-fibo2-edit` y obtener imágenes de 1024x1024 en su propio equipo, aprovechando que los pesos Q5 caben en 8,8 GB.
- Edición de imágenes en flujos creativos: al derivar de un modelo "edit", puede emplearse para modificar imágenes existentes según instrucciones textuales, aunque la documentación disponible no detalla la interfaz exacta de edición.
- Generación de material gráfico para documentación técnica: creación de ilustraciones de apoyo (diagramas conceptuales, escenas descriptivas) a partir de descripciones textuales, con control de semilla para reproducir resultados en la documentación versionada.
- Evaluación comparativa de cuantizaciones: investigadores que estudien el impacto de la cuantización en modelos de difusión pueden comparar las variantes Q3 a BF16 del mismo modelo base manteniendo el resto de parámetros constantes.
- Integración en aplicaciones de escritorio para macOS: al ejecutarse sobre MLX, el modelo puede incorporarse en herramientas nativas de Mac que necesiten generación de imágenes sin conexión a internet.
- Investigación sobre despliegue en hardware de consumo: sirve como banco de pruebas para medir latencia y consumo de memoria de un modelo de difusión cuantizado en memoria unificada de Apple Silicon.
- Generación de borradores visuales en entornos con requisitos de privacidad: al no enviar prompts a servidores externos, es adecuado para equipos que manejen descripciones sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 8,8 GB en Q5; se necesita memoria unificada suficiente para cargar los pesos más el overhead de inferencia (no cuantificado en la documentación).
- Hardware objetivo: Apple Silicon con MLX (la model card no especifica modelos de chip concretos ni mínimos de memoria unificada).
- GPU NVIDIA/AMD: no soportadas por esta conversión, que está empaquetada para MLX; para CUDA habría que acudir a los pesos originales o a otras conversiones.
- Despliegue: MFlux (`uv tool install --upgrade mflux`), con el comando `mflux-generate-fibo2-edit`; descarga opcional de pesos con `hf download`.
- Alternativas de cuantización para ajustar memoria: Q3 (5,6 GB), Q4 (7,2 GB), Q6 (10,3 GB), Q8 (13,4 GB), BF16 (25,1 GB).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fibo-2-0-edit-turbo-mflux-q5 (este) | no disponible | no disponible | MLX safetensors Q5, 8,8 GB | fibo-2.0-edit-turbo-license | HuggingFace, 76 descargas |
| fibo-2-0-edit-turbo-mflux-bf16 | no disponible | no disponible | MLX safetensors BF16, 25,1 GB | fibo-2.0-edit-turbo-license | HuggingFace |
| fibo-2-0-edit-turbo-mflux-q8 | no disponible | no disponible | MLX safetensors Q8, 13,4 GB | fibo-2.0-edit-turbo-license | HuggingFace |
| briaai/Fibo-2.0-edit-turbo (original) | no disponible | no disponible | no disponible en la información | fibo-2.0-edit-turbo-license | HuggingFace |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos competidores en la información proporcionada, por lo que la comparación se limita a las variantes del mismo modelo base y a su versión original.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio lo mantiene MFlux-Community, no los autores de briaai/Fibo-2.0-edit-turbo; no debe tratarse como una release respaldada por el autor original.
- La cuantización a 5 bits puede degradar la fidelidad de las imágenes respecto a BF16; no se documenta en la información disponible la magnitud de esa pérdida.
- Licencia "other" (fibo-2.0-edit-turbo-license): es imprescindible revisar los términos en la model card original antes de cualquier uso comercial, ya que pueden existir restricciones no reflejadas en esta ficha.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a CPU convencional sin reconversión.
- No se documentan sesgos conocidos, tasas de alucinación visual ni limitaciones idiomáticas del modelo base en la información disponible.
- El modelo está pensado para generación y edición de imágenes; no es un modelo de lenguaje y no debe emplearse para tareas de texto, código o razonamiento.
- El repositorio tiene un uso muy bajo (76 descargas, 0 likes) y fue creado y actualizado en octubre de 2026, por lo que la validación comunitaria es escasa.
- No se especifican requisitos mínimos de memoria unificada; cargar 8,8 GB de pesos más el overhead de inferencia puede superar la capacidad de equipos con 16 GB.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q5
- Modelo base original: https://huggingface.co/briaai/Fibo-2.0-edit-turbo
- Variante BF16: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/fibo-2-0-edit-turbo-mflux-q3
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
