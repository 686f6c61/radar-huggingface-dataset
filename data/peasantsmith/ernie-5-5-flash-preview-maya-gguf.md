# peasantsmith/ERNIE-5.5-Flash-Preview-Maya-GGUF

## Resumen

ERNIE-5.5-Flash-Preview-Maya-GGUF es una coleccion de cuantizaciones experimentales en formato GGUF del modelo base baidu/ERNIE-5.5-Flash-Preview, publicadas por el usuario peasantsmith bajo el identificador de "Maya". El repositorio no contiene un modelo entrenado de forma independiente, sino una reempaquetacion del modelo original de Baidu en tres variantes de cuantizacion (Maya-XS, Maya-S y Maya-M) pensadas para un runtime denominado Maya que, segun el propio autor, no existe como programa publicado.

La relevancia de esta ficha es limitada y fundamentalmente documental: el autor advierte de forma explicita que los ficheros son solo experimentales, que ningun programa liberado los carga y que no han sido probados en ningun motor de inferencia. Se desconoce la arquitectura, el numero de parametros, la longitud de contexto y los datos de entrenamiento del modelo base, ya que la model card no los detalla y no se ha proporcionado informacion adicional.

El interes tecnico se reduce a la tabla de calidad relativa que ofrece el autor: frente al modelo original, la variante Maya-XS conserva un 87,6 % de coincidencia en el siguiente token, Maya-S un 91,4 % y Maya-M un 96,0 %. Estas cifras miden fidelidad de cuantizacion, no calidad absoluta del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S (Maya-XS), IQ2_XXS (Maya-S), IQ3_S (Maya-M) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multifichoro, 2-3 ficheros por variante) mas un drafter separado de 11 GB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base baidu/ERNIE-5.5-Flash-Preview: la model card del repositorio cuantizado no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de tokens de entrenamiento, la composicion del dataset o las fases de alineacion (RLHF, DPO u otras).

Lo unico documentado es el proceso de cuantizacion. El autor empaqueta el modelo en tres niveles de compresion con perdida creciente y conserva sin modificar el "draft head" del modelo original (directorio `drafter/`, 11 GB), lo que sugiere que el modelo base incorpora decodificacion especulativa con un cabezal de borrador propio. Se incluyen sumas de verificacion SHA256 para cada variante (`SHA256SUMS`, `SHA256SUMS.Maya-S`, `SHA256SUMS.Maya-M`).

## Capacidades

- Generacion de texto en ingles y chino, segun los metadatos del repositorio (`pipeline_tag: text-generation`).
- Decodificacion especulativa potencial: el repositorio incluye el cabezal de borrador original del modelo, aunque no hay runtime publicado que lo utilice.
- No se documentan capacidades de tool calling, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta soporte de agentes ni function calling.
- Capacidades multilingues limitadas a los idiomas declarados (en, zh); no hay evidencia de soporte de castellano.

## Casos de uso

- Investigacion sobre tecnicas de cuantizacion extrema: las tres variantes (IQ1_S, IQ2_XXS, IQ3_S) permiten estudiar la degradacion de la fidelidad de token siguiente en rangos de 1 a 3 bits, con metricas reportadas del 87,6 %, 91,4 % y 96,0 %.
- Analisis de empaquetado multifichoro en GGUF: util para quien investigue como dividir pesos cuantizados en 2-3 ficheros y verificar integridad mediante sumas SHA256.
- Estudio de cabezales de borrador para decodificacion especulativa: el directorio `drafter/` de 11 GB permite analizar la estructura de un draft head asociado a un modelo grande.
- Referencia para desarrolladores de runtimes de inferencia: sirve como caso de prueba de compatibilidad de formato, aunque el autor advierte que ningun motor lo carga actualmente.
- Documentacion de advertencias de publicacion: ejemplo de model card que declara explicitamente el caracter no utilizable de los artefactos, util en formacion sobre buenas practicas de publicacion de modelos.
- Archivo de cuantizaciones de modelos chinos de gran tamano: permite conservar una instantanea de las variantes comprimidas de ERNIE-5.5-Flash-Preview para comparaciones futuras, siempre con la cautela de que no son ejecutables con software publicado.

## Benchmarks y rendimiento

| Variante | Ficheros | Tamano total | Coincidencia de siguiente token vs. original |
|---|---|---:|---:|
| Maya-XS (IQ1_S) | 2 | 65,3 GB | 87,6 % |
| Maya-S (IQ2_XXS) | 2 | 80,9 GB | 91,4 % |
| Maya-M (IQ3_S) | 3 | 127,4 GB | 96,0 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores miden fidelidad de cuantizacion, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 65,3 GB para Maya-XS, 80,9 GB para Maya-S y 127,4 GB para Maya-M, mas el espacio del drafter (11 GB) si se usa decodificacion especulativa.
- GPU recomendadas: ninguna verificada; por tamano, las variantes requeririan GPU de 80 GB (A100, H100) en configuracion single-GPU para las dos primeras y multiples GPU para Maya-M.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de 48 GB sin offloading a CPU/RAM, lo que degradaria gravemente el rendimiento.
- Opciones de despliegue: el autor declara que ningun programa liberado carga estos GGUFs y que no han sido probados en ningun motor; no se puede confirmar compatibilidad con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ERNIE-5.5-Flash-Preview-Maya-GGUF | no disponible | no disponible | Apache 2.0 | GGUF experimental, sin runtime | Cuantizaciones IQ1-IQ3 de un modelo base no documentado |
| baidu/ERNIE-5.5-Flash-Preview | no disponible | no disponible | no disponible en la informacion | Modelo original en Hugging Face | Base de las cuantizaciones; sin datos tecnicos en la informacion proporcionada |
| Otras cuantizaciones GGUF de modelos chinos de gran tamano | variable | variable | variable | Ejecutables en llama.cpp/Ollama | No se dispone de datos concretos para una comparacion cifrada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- El autor declara explicitamente: "Experimental only. Do not use these files." No deben emplearse en produccion.
- Ningun programa liberado carga estos GGUFs; no han sido probados en ningun motor de inferencia.
- Los ficheros pueden cambiar o eliminarse en cualquier momento sin aviso.
- La cuantizacion introduce perdida: incluso Maya-M solo conserva el 96,0 % de coincidencia de siguiente token; Maya-XS baja al 87,6 %.
- Idiomas limitados a ingles y chino; sin soporte documentado de castellano.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado por el autor.
- La licencia Apache 2.0 se hereda del modelo base, pero la falta de documentacion sobre este impide verificar restricciones adicionales de uso comercial.
- El repositorio ocupa 284,6 GB, lo que exige almacenamiento considerable incluso para pruebas.
- No hay informacion sobre la arquitectura, el contexto o los datos de entrenamiento del modelo base, lo que impide evaluar su idoneidad para tareas concretas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peasantsmith/ERNIE-5.5-Flash-Preview-Maya-GGUF
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview
