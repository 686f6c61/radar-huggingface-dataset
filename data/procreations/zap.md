# ProCreations/Zap

## Resumen

Zap es un modelo de clasificación de tokens (token classification) desarrollado por ProCreations, diseñado específicamente para la clasificación de formularios web y campos de entrada en el contexto de gestores de contraseñas y extensiones de autocompletado. Con 20,7 millones de parámetros, se posiciona como un modelo "tiny" que se ejecuta localmente, sin necesidad de enviar datos de formularios a servidores externos, lo que resulta relevante para la privacidad en el navegador. Su tarea consiste en responder dos preguntas: para qué sirve un formulario (11 propósitos posibles) y qué espera cada campo de entrada (26 tipos posibles).

El modelo está construido sobre una arquitectura tipo BERT para clasificación de tokens, con 20.699.173 parámetros reales según los pesos safetensors, y se distribuye tanto en safetensors como en formato ONNX (fp32 e int8), además de ser compatible con transformers.js para su uso en extensiones de navegador. Según la model card, supera de forma clara a la heurística basada en palabras clave que suelen emplear los gestores de contraseñas comerciales, con una precisión de campo del 97,2 % y una F1 macro de 0,945 en sitios web retenidos.

Su relevancia actual radica en que aborda un problema muy concreto pero crítico: rellenar correctamente formularios de inicio de sesión, registro, recuperación de contraseña, pago o cambio de contraseña en sitios reales donde los atributos `autocomplete` no son fiables o están ausentes. Al ser un modelo pequeño y ejecutable en CPU, puede integrarse en el cliente sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) para clasificacion de tokens |
| Parametros totales | 20.699.173 (~20,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (los formularios mas largos se dividen en ventanas que repiten el contexto del formulario y se promedian los logits de `[CLS]`) |
| Tipos de cuantizacion | bf16 (pesos principales), ONNX fp32, ONNX int8 |
| Idiomas soportados | multilingue (los idiomas concretos no estan listados en la informacion disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16, 41 MB) y ONNX (fp32 83 MB, int8 21 MB) |

Datos adicionales: pipeline `token-classification`, libreria `transformers`, tamano del repositorio 0,1 GB, etiquetas que incluyen `autofill`, `password-manager`, `form-classification`, `field-classification`, `browser-extension` y `onnx`. El modelo es compatible con endpoints de inferencia de Hugging Face.

## Arquitectura y entrenamiento

Zap es un encoder transformer de tipo BERT adaptado a clasificacion de tokens. La decodificacion es especifica: la etiqueta de cada campo se lee en su token `[FLD]`, restringida al conjunto de etiquetas `field:*`, mientras que el proposito del formulario se lee en el token `[CLS]`, restringido al conjunto `form:*`. Cuando un formulario supera los 512 tokens, se divide en ventanas independientes que repiten el contexto del formulario, y los logits de `[CLS]` se promedian entre ventanas para obtener la prediccion final.

El modelo no lee HTML en crudo. Consume una representacion textual compacta de cada formulario que incluye titulo de pagina, palabras de la URL, atributos del formulario, encabezados, botones y enlaces, y para cada campo su tipo, nombre, id, `autocomplete`, placeholder, etiqueta y texto cercano. El modelo se evaluo en 6.838 formularios reales y 19.811 campos procedentes de paginas de Common Crawl en dominios nunca vistos durante el entrenamiento. La model card menciona la existencia de un "LLM teacher" que actua como referencia en parte de las comprobaciones, pero no se detallan el procedimiento de destilacion, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Clasificacion de campos de formulario en 26 clases: `username`, `email`, `current-password`, `new-password`, `one-time-code`, `tel`, `name`, `given-name`, `family-name`, `organization`, `street-address`, `address-line2`, `address-level2` (ciudad), `address-level1` (estado o region), partes de direccion, partes de tarjeta de pago, `bday`, `search`, `captcha`, `other`, entre otras.
- Clasificacion del proposito del formulario en 11 clases: `login`, `signup`, `password-change`, `password-recovery`, `otp`, `payment`, `address`, `newsletter`, `contact`, `search`, `other`.
- Distincion entre contrasena actual y contrasena nueva, incluyendo el campo de confirmacion, con una F1 de 0,996 en deteccion de campos de contrasena y un 99,2 % de acierto en la distincion actual/nueva sobre campos de contrasena.
- Deteccion de identificadores de inicio de sesion (`username` o `email`) con F1 de 0,994.
- Deteccion de honeypots y campos no relevantes mediante la etiqueta `other`.
- Funcionamiento sin atributos `autocomplete` fiables: recupera el token correcto en el 97,8 % de los casos cuando el atributo se elimina de la entrada.
- Soporte multilingue declarado en las etiquetas del modelo.
- Ejecucion local en navegador mediante transformers.js y ONNX (fp32 o int8), sin llamadas a servidores externos.
- Extractor JavaScript (`zap-extract.js`) que construye la entrada del modelo a partir del DOM vivo, y modulo de inferencia (`zap-infer.js`) que gestiona el ventaneo y la decodificacion.
- API en Python con `Zap.from_pretrained(...)` y `zap.classify_html(html, url=...)`.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso en el sentido de un LLM.

## Casos de uso

- Autocompletado en gestores de contrasenas: el modelo identifica cual es el campo de usuario y cual el de contrasena actual en un formulario de inicio de sesion, incluso cuando el sitio usa `autocomplete="off"` o campos sin tipo declarado, permitiendo rellenar credenciales guardadas sin falsos positivos.
- Generacion y confirmacion de contrasenas nuevas: en formularios de registro o cambio de contrasena, distingue el campo de contrasena nueva del de confirmacion y del de contrasena actual, con un 99,2 % de acierto en esa distincion, lo que evita sobrescribir credenciales existentes por error.
- Relleno de formularios de pago: clasifica los campos de tarjeta (numero, caducidad, CVC) y el proposito `payment`, permitiendo autocompletar datos de pago de forma selectiva solo en formularios de compra legitimos.
- Relleno de direcciones y datos personales: identifica `street-address`, `address-line2`, ciudad, region, codigo postal y nombre, tanto en formularios de envio como en registros, reduciendo el trabajo manual en checkouts.
- Extension de navegador con procesamiento local: al ejecutarse en el cliente con ONNX int8 (21 MB, 3,1 ms por formulario en CPU Apple M4 Max), es viable integrarlo en una extension sin enviar el DOM ni las credenciales a ningun servidor.
- Deteccion de formularios de recuperacion y OTP: reconoce `password-recovery`, `otp` y los campos de codigo de verificacion, incluidos los formularios con casillas separadas para cada digito, lo que permite automatizar la introduccion del codigo recibido por SMS o correo.
- Analisis de formularios a gran escala: con 6.838 formularios y 19.811 campos procesados en el conjunto de evaluacion, puede usarse para auditar accesibilidad, detectar formularios mal etiquetados o medir la calidad de la semantica de formularios en un crawl web.
- Prevencion de fraude y deteccion de honeypots: la etiqueta `other` y la clasificacion por formulario permiten descartar campos trampa o formularios sospechosos antes de interactuar con ellos.

## Benchmarks y rendimiento

Resultados sobre sitios web retenidos: 6.838 formularios reales y 19.811 campos de paginas de Common Crawl en hosts nunca vistos en entrenamiento, comparados con una heuristica de palabras clave del tipo que usan los gestores de contrasenas (confia en `autocomplete`, luego en el `type` del input, luego en regex multilingues sobre name/id/placeholder/label y texto cercano).

| Metrica | Zap | Heuristica de palabras clave |
|---|---|---|
| Precision de campo (26 clases) | 97,2 % | 82,7 % |
| F1 macro de campo | 0,945 | 0,723 |
| Precision de proposito de formulario (11 clases) | 95,7 % | 71,6 % |
| F1 de deteccion de campo de contrasena | 0,996 | 0,968 |
| Contrasena actual frente a nueva (sobre campos de contrasena) | 99,2 % | 85,5 % |
| F1 de identificador de inicio de sesion (`username`/`email`) | 0,994 | 0,945 |
| Recuperacion del token propio con `autocomplete` eliminado de la entrada | 97,8 % | 78,7 % |

Pruebas de paridad (400 paginas reales aleatorias): el extractor JavaScript (DOM via jsdom) y el extractor Python producen la misma entrada de modelo para los 821 formularios que encuentra el lado JS; el lado Python encuentra 4 formularios adicionales en 2 paginas spam mal formadas. La inferencia de extremo a extremo produce etiquetas identicas para 818/818 formularios y 1.413/1.413 campos entre JS (transformers.js + ONNX) y Python (PyTorch).

Velocidad medida en CPU Apple M4 Max con onnxruntime via transformers.js, solo el modelo: 5,3 ms por formulario con ONNX fp32 y 3,1 ms con ONNX int8. El archivo int8 coincide con fp32 en el 99,91 % de las predicciones y con bf16 en PyTorch en el 99,99 %.

## Requisitos de hardware

- El modelo es muy pequeno: 41 MB en safetensors bf16, 83 MB en ONNX fp32 y 21 MB en ONNX int8.
- Inferencia en CPU sin GPU: los benchmarks de velocidad se midieron precisamente en CPU (Apple M4 Max), con 5,3 ms por formulario en fp32 y 3,1 ms en int8.
- VRAM estimada para inferencia: inferior a 1 GB en cualquier configuracion. Cabe en cualquier GPU consumer, incluida una GTX 1050 o una GPU integrada, y tambien en el propio navegador.
- GPU recomendadas: no se especifica ninguna en la informacion disponible; cualquier GPU con al menos 1 GB de memoria es mas que suficiente y, de hecho, la GPU no es necesaria.
- Opciones de despliegue: `transformers` con PyTorch (CPU o GPU), ONNX Runtime, `transformers.js` (navegador y Node.js) y endpoints de inferencia de Hugging Face (la etiqueta `endpoints_compatible` esta presente). No aplica vLLM ni TGI al no ser un modelo generativo.
- Latencia y throughput: 3,1 a 5,3 ms por formulario en CPU Apple M4 Max, segun la cuantizacion. No se proporcionan datos de throughput agregado ni latencia en GPU.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos directamente comparables de la misma categoria (clasificacion de formularios web para autocompletado) con datos publicos de parametros, contexto o rendimiento. La unica referencia cuantitativa disponible es la heuristica de palabras clave que emplean los gestores de contrasenas, que no es un modelo entrenado sino un conjunto de reglas.

| Sistema | Parametros | Enfoque | Precision de campo | Precision de proposito | Licencia |
|---|---|---|---|---|---|
| Zap | 20,7 M | BERT de clasificacion de tokens | 97,2 % | 95,7 % | MIT |
| Heuristica de palabras clave | no aplica | Reglas basadas en `autocomplete`, `type` y regex | 82,7 % | 71,6 % | no aplica |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito limitado: cubre 26 tipos de campo y 11 propositos de formulario. Cualquier campo que no encaje en esas categorias cae en `other`, lo que puede degradar el autocompletado en formularios especializados.
- Longitud de contexto de 512 tokens: los formularios largos se procesan por ventanas y los logits de `[CLS]` se promedian, lo que puede perder informacion contextual en formularios con muchos campos o texto muy extenso.
- Dependencia del extractor: el modelo no lee HTML crudo, sino una representacion textual construida por `zap-extract.js` o el extractor Python. La paridad entre ambos esta verificada, pero paginas mal formadas pueden producir diferencias en el numero de formularios detectados (4 formularios de diferencia en 2 paginas spam del conjunto de prueba).
- Riesgo de error en atributos enganosos: un sitio puede declarar un `autocomplete` incorrecto o malicioso. Aunque Zap recupera el token correcto en el 97,8 % de los casos cuando el atributo se elimina, no hay garantia frente a atributos deliberadamente falsificados.
- Idiomas: la etiqueta declara soporte multilingue, pero la informacion disponible no especifica la lista de idiomas cubiertos ni el rendimiento por idioma. El modelo se evaluo sobre paginas de Common Crawl sin desglose linguistico publicado.
- Sesgos: no se documentan analisis de sesgo en la model card. Al entrenarse sobre paginas web reales, puede heredar los sesgos de representacion de ese corpus (por ejemplo, formularios poco habituales o practicas regionales infrarrepresentadas).
- Riesgo de alucinacion: limitado en el sentido generativo, ya que el modelo solo asigna etiquetas de un conjunto cerrado. El riesgo real es de clasificacion incorrecta con alta confianza, no de invencion de contenido.
- Adopcion y validacion externa: el modelo tiene 0 descargas y 0 "likes" en el momento de la consulta, y fue publicado el 25 de septiembre de 2026. No hay evidencia publica de validacion por terceros ni de uso en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones relevantes, siempre que se conserve el aviso de copyright y la licencia. No se detectan clausulas de uso aceptable adicionales.
- Caveat de produccion: la evaluacion se hizo sobre un conjunto retenido del propio autor; conviene validar el modelo con formularios propios antes de desplegarlo en un gestor de contrasenas real, dado el coste de un falso negativo en un campo de contrasena.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ProCreations/Zap
- Pagina de modelos de ProCreations en Hugging Face: https://huggingface.co/ProCreations/models
- Ficha de ProCreations en AI Market Cap: https://aimarketcap.tech/providers/procreations
- Otro modelo del mismo autor, ProCreations/auto-0.4b: https://huggingface.co/ProCreations/auto-0.4b
