# KleptoCook/label-reader

## Resumen

KleptoCook/label-reader es un modelo de vision-lenguaje en formato GGUF pensado para ejecutarse en el propio dispositivo (on-device) y leer tablas de informacion nutricional a partir de una fotografia. Lo publica KleptoCook, la aplicacion de recetas del mismo nombre, y se distribuye como una conversion lista para llama.cpp del modelo base Qwen/Qwen3.5-0.8B junto con su proyector visual. El modelo no esta afinado: los dos ficheros son el modelo y el proyector tal y como los publico Qwen, cuantizados y convertidos para que funcionen dentro de la app.

La relevancia de esta ficha esta en su enfoque: en lugar de un modelo grande servido en la nube, se trata de un modelo de menos de 800 millones de parametros empaquetado en dos ficheros GGUF de 542 MB y 205 MB que caben holgadamente en un telefono. El caso de uso es acotado pero concreto: extraer los valores por 100 g o 100 ml (energia, grasas, saturadas, hidratos, azucares, fibra, proteinas y sal) y devolverlos como JSON, sin que la foto salga del dispositivo.

El repositorio es de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, licencia Apache 2.0 (la misma que Qwen3.5) y soporte exclusivo de ingles. La model card documenta un conjunto de pruebas propio sobre 79 fotos de etiquetas britanicas de Open Food Facts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje derivado de Qwen/Qwen3.5-0.8B con proyector visual (mmproj); detalles internos del transformer no disponibles |
| Parametros totales | 772.845.888 (~773 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la app limita a 1.024 tokens de imagen por consulta) |
| Tipos de cuantizacion | Q4_K_M para el modelo y F16 para el proyector; no se ofrecen otras |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp, build 10256) |

## Arquitectura y entrenamiento

El modelo es una conversion del base Qwen/Qwen3.5-0.8B a la que se anade el proyector visual correspondiente, ambos en GGUF. La model card indica explicitamente que no hay afinado: los pesos son los que publico Qwen, cuantizados el modelo a Q4_K_M (542 MB) y mantenido el proyector en F16 (205 MB). La conversion se hizo con el build 10256 de llama.cpp, que es la version que embarca llama.rn en la aplicacion, de modo que el empaquetado esta alineado con el runtime que lo ejecuta.

No se documentan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF o DPO, ni innovaciones de atencion o decodificacion. Lo unico caracteristico del uso es la configuracion de inferencia: una sola imagen por consulta, modo thinking desactivado, temperatura 0 y un maximo de 1.024 tokens de imagen, con una consigna fija que pide JSON estricto con nueve campos numericos y `null` para lo que no aparezca en la etiqueta.

## Capacidades

- Lectura de tablas de informacion nutricional a partir de una fotografia de la etiqueta.
- Extraccion estructurada de nueve campos por 100 g o 100 ml: `energy_kj`, `energy_kcal`, `fat`, `saturates`, `carbohydrate`, `sugars`, `fibre`, `protein` y `salt`.
- Salida en JSON segun un esquema fijo, con `null` para los valores ausentes.
- Normalizacion de unidades: devuelve los datos por 100 g o 100 ml, no por racion ni por envase.
- Modo conversacional y de vision, heredados de Qwen3.5-0.8B.
- Ejecucion local en el dispositivo con llama.cpp, sin envio de la imagen a un servidor.
- Capacidad de razonamiento limitada por el tamano del modelo y por la desactivacion del modo thinking en el uso previsto.
- Soporte de tool calling / function calling y de agentes: no disponible.
- Otras capacidades multimodales (audio, video): no disponible.

## Casos de uso

- Registro de comidas en una app de recetas: el usuario fotografia la etiqueta y el modelo devuelve los valores por 100 g en JSON, que la aplicacion inserta directamente en la ficha del alimento sin transcripcion manual.
- Calculo de macros por racion: a partir de los valores por 100 g extraidos, la app aplica el peso de la racion y obtiene energia, grasas, hidratos y proteinas sin que el usuario introduzca numeros.
- Digitalizacion de despensa: leer varias etiquetas seguidas y construir una base local de productos con sus datos nutricionales.
- Comparacion de productos en tienda: leer la etiqueta de dos productos y contrastar azucares, saturadas o sal por 100 g para decidir la compra, con todo el proceso en el telefono.
- Aplicaciones de salud y dietetica con requisito de privacidad: al no salir la foto del dispositivo, es apto para entornos donde no se permite enviar imagenes de productos o de etiquetas a un servicio externo.
- Validacion automatica de datos: la propia app comprueba que la energia sea coherente con las grasas, hidratos y proteinas introducidos y pide confirmacion al usuario, lo que sirve como capa de control en cualquier pipeline que consuma la salida.
- Prototipado de vision con modelos pequenos: sirve como referencia de como empaquetar un modelo y su proyector en GGUF para llama.rn en movil.

## Benchmarks y rendimiento

La model card aporta un unico conjunto de resultados, obtenido sobre 79 fotografias de etiquetas nutricionales del Reino Unido procedentes de Open Food Facts, con verificacion manual de cada cifra contra la foto:

| Metrica | Resultado |
|---|---|
| Cifras leidas correctamente | 87 % |
| Etiquetas con todas las cifras correctas | 76 % |
| Tamano del conjunto de prueba | 79 fotos (etiquetas UK, Open Food Facts) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/tamano de pesos: 542 MB el modelo en Q4_K_M mas 205 MB el proyector en F16, aproximadamente 747 MB de ficheros; el peso en memoria es del orden de esos valores mas el contexto.
- Cabe en cualquier GPU de consumo actual y en hardware movil, dado que el objetivo declarado es la ejecucion on-device en un telefono.
- GPU recomendadas: no disponible; no se especifican modelos concretos porque el destino es el dispositivo movil, no un servidor.
- Opciones de despliegue: llama.cpp (build 10256) y llama.rn, que es el runtime que usa la app; otras integraciones no documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KleptoCook/label-reader | ~773 M | no disponible | GGUF (Q4_K_M + F16 mmproj) | Apache 2.0 | Conversion de Qwen3.5-0.8B para lectura de etiquetas nutricionales en movil |
| Qwen/Qwen3.5-0.8B | ~773 M | no disponible | safetensors (base) | Apache 2.0 | Modelo base sin proyector visual en el repositorio de KleptoCook |
| Otros VLM pequenos para movil (SmolVLM, Moondream) | no disponible | no disponible | no disponible | no disponible | Alternativas de la misma categoria, pero no se dispone de datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo no esta afinado: cualquier limitacion de Qwen3.5-0.8B se traslada directamente, incluido el sesgo de un modelo de menos de 1.000 millones de parametros.
- Tasa de error documentada: lee mal el 13 % de las cifras y falla al menos una cifra en el 24 % de las etiquetas, por lo que la salida no debe usarse sin verificacion.
- Idioma: solo ingles; las etiquetas en castellano no estan cubiertas por la model card ni por las pruebas.
- Dominio muy estrecho: esta pensado para tablas de informacion nutricional, no como VLM de proposito general.
- Riesgo de alucinacion: al pedir JSON con campos numericos fijos, existe el riesgo de rellenar valores plausibles cuando la etiqueta no los muestra; el propio autor mitiga esto con la posibilidad de devolver `null` y con la comprobacion de coherencia energetica.
- Limitacion de entrada: se usa una imagen por consulta y un maximo de 1.024 tokens de imagen, sin modo thinking.
- Dependencia del runtime: los pesos se convirtieron para el build 10256 de llama.cpp, por lo que otras versiones pueden no ser compatibles.
- Privacidad: la imagen se procesa en el dispositivo, lo que es una ventaja, pero implica que no hay servidor que corrija errores de lectura en tiempo real.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial, en linea con la licencia de Qwen3.5.
- Adopcion nula en el momento de la consulta: cero descargas y cero likes, sin comunidad que haya validado el modelo al margen del autor.
- Fechas del repositorio: creado y actualizado el 11 de octubre de 2026, sin historial posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KleptoCook/label-reader
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Aplicacion KleptoCook: https://kleptocook.com
- Open Food Facts (origen de las fotos de prueba): https://world.openfoodfacts.org
- llama.cpp: https://github.com/ggml-org/llama.cpp
