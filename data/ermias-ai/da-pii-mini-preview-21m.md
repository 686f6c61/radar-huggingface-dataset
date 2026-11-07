# ermias-ai/da-pii-mini-preview-21m

## Resumen

`da-pii-mini-preview-21m` es un clasificador de tokens (token classification) de pequeno tamano desarrollado por ermias-ai para detectar posibles datos personales (PII) en textos en danes e ingles. Con 20.729.541 parametros y apenas 0,1 GB de repositorio, el modelo actua como componente NER de la extension de navegador PromptSkjold, que verifica el texto de forma local antes de enviarlo a un chatbot de IA. El objetivo es marcar candidatos para revision humana, no sustituir un proceso de anonimizacion automatizado.

Tecnicamente es un fine-tune de `bardsai/eu-pii-multi-mini-preview`, que a su vez deriva de `nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large` (una destilacion estilo MiniLM de XLM-RoBERTa Large). El autor ha podado el vocabulario a danes e ingles (unos 25.700 tokens) y ha cuantizado el fichero ONNX a int8, lo que reduce el modelo a 21,8 MB y permite ejecutarlo en el navegador via WASM.

Su relevancia actual radica en el enfoque de privacidad en el borde (edge): inferencia local en el navegador, sin enviar datos a servidores, con latencias de unos 90 ms para 128 tokens y 400 ms para una ventana de 480 tokens en un portatil con un solo hilo. La version publicada corresponde a la "ronda 6, variante a" del proceso de entrenamiento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLMv2-L6-H384, destilado de XLM-RoBERTa Large) |
| Parametros totales | 20.729.541 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como limite nativo; el autor usa ventanas de 480 tokens con solapamiento de 64 en la aplicacion |
| Tipos de cuantizacion | int8 (fichero `model_int8mm_embq.onnx`); pesos safetensors en el repositorio |
| Idiomas soportados | danes (da), ingles (en); solo texto en alfabeto latino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo MiniLM con 6 capas y dimension oculta 384, destilado originalmente de XLM-RoBERTa Large. La cabeza de clasificacion de tokens conserva el conjunto de etiquetas del modelo base: 69 etiquetas de token incluyendo `O` y las formas `B-`/`I-` de cada tipo. El vocabulario se podo a danes e ingles (aproximadamente 25.700 tokens) y el fichero ONNX se cuantizo a int8.

El fine-tune se realizo en varias rondas sobre texto sintetico y generado por LLM en danes e ingles: prompts de chat, notas de RRHH y de casos, CVs, logs, documentos largos, nombres de multiples origenes y negativos dificiles (precios, SKUs, saludos). Los datos se cortaron en ventanas de 480 tokens con solapamiento de 64 para alinear el entrenamiento con la inferencia. La version publicada es la "ronda 6, variante a": 5 epocas, peso de 0,25 para etiquetas raras y 13.215 filas de entrenamiento. Una septima ronda no supero la regla de aceptacion pre-registrada y se descarto. No se menciona uso de RLHF ni DPO, algo esperable en un modelo de clasificacion.

## Capacidades

- Deteccion de entidades nombradas orientada a PII: personas, organizaciones, ubicaciones, direcciones postales, titulos profesionales, fechas de nacimiento, importes financieros e identificadores de documentos.
- Deteccion de identificadores de contacto y credenciales: cuentas bancarias, handles de contacto, secretos de autenticacion, correo electronico, telefono, direccion IP y etiquetas de tarjeta de pago.
- Clasificacion de tokens con etiquetas `B-`/`I-` para agrupacion de spans por offsets de bytes.
- Soporte bilingue danes-ingles con vocabulario podado a ambos idiomas.
- Ejecucion local en navegador mediante ONNX Runtime Web (WASM), sin envio de datos a servidores.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Verificacion previa al envio en asistentes de IA: la extension PromptSkjold ejecuta el modelo sobre el texto del usuario antes de enviarlo a un chatbot, marcando PII para que la persona decida que reemplazar. Es adecuado por su tamano reducido y su inferencia local.
- Extensiones de navegador con procesamiento en el dispositivo: el fichero ONNX int8 de 21,8 MB y las latencias de 90-400 ms permiten integrarlo en el cliente sin backend.
- Revision de CVs y notas de RRHH: el entrenamiento incluye notas de casos y CVs, por lo que puede marcar nombres, titulos y datos de contacto antes de compartir documentos internamente.
- Preprocesado de logs y documentos largos: las ventanas de 480 tokens con solapamiento de 64 permiten procesar documentos extensos por fragmentos en un pipeline de revision.
- Filtrado de prompts en entornos de investigacion: util para marcar datos personales en corpus de prompts de chat antes de su analisis o publicacion.
- Capa de triaje en pipelines de anonimizacion: combinado con reglas de patrones y checksums (CPR danes, IBAN, tarjetas, correo, IP), el modelo aporta la componente semantica de deteccion mientras las reglas cubren los formatos fijos.
- Demostraciones educativas de privacidad en el borde: el Space de demostracion ejecuta el modelo localmente, lo que sirve para ilustrar tecnicas de inferencia privada en el navegador.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados solo con el modelo (sin reglas de la extension). "Cobertura completa" significa que todos los caracteres de un identificador quedan dentro de un span marcado.

| Prueba | R6a | Modelo base |
|---|---|---|
| Identificadores directos encontrados (218 prompts, 185 identificadores) | 96 % (178) | 88 % (162) |
| Identificadores directos con cobertura completa | 175 de 185 | 150 de 185 |
| Nombres completos cubiertos (438 menciones, unos 30 grupos de origen) | 97 % | 91 % |
| Nombres en minusculas | 79 de 87 | 51 de 87 |
| Prompts informales de voces variadas (180), todos los identificadores cubiertos | 85 % | 62 % |
| Prompts dictados (speech-to-text, 18), todos los identificadores cubiertos | 8 de 18 | 8 de 18 |
| Prompts de negocio inofensivos marcados por error (80, figuras publicas toleradas) | 5 | 20 |
| Prompts informales inofensivos marcados por error (80) | 32 | 30 |
| Palabras con forma de nombre (marcas, platos, mascotas) marcadas como personas por error (60) | 52 | 55 |

Otras metricas publicadas:

| Conjunto | Metrica | R6a | Base |
|---|---|---|---|
| Kiji (test danes, pipeline completo de la extension) | Identificadores nucleares encontrados / precision ajustada | 95 % / 96 % | no disponible |
| PIIMB (filas danesas, solo modelo) | F2 en ai4privacy | 0,75 | 0,94 |
| PIIMB (filas danesas, solo modelo) | F2 en MAPA legal | 0,16 | 0,46 |

El autor explica que la caida en PIIMB es deliberada: el benchmark enmascara toda fecha, edad, genero, ciudad y ocupacion, mientras que R6a solo los marca cuando identifican a una persona. En nombres, correo, telefono y tarjetas de pago iguala al modelo base.

Rendimiento en navegador (WASM, un hilo, portatil): aproximadamente 90 ms para 128 tokens y 400 ms para una ventana de 480 tokens.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en int8; el fichero ONNX ocupa 21,8 MB y los pesos safetensors completos caben en el repositorio de 0,1 GB.
- GPU recomendadas: no requiere GPU; esta disenado para CPU en navegador via WASM.
- Cabe en cualquier GPU de consumo e incluso en CPU de portatil; no hay requisitos de VRAM relevantes.
- Opciones de despliegue: ONNX Runtime Web (WASM) en navegador, ONNX Runtime en servidor, y la libreria transformers para los pesos safetensors.
- Latencia: unos 90 ms para 128 tokens y 400 ms para 480 tokens en navegador, un hilo, en un portatil. No se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| da-pii-mini-preview-21m | 20,7 M | ventanas de 480 tokens en la aplicacion | da, en | Apache-2.0 | Fine-tune especializado en PII para navegador; F2 0,75 en PIIMB ai4privacy (solo modelo) |
| bardsai/eu-pii-multi-mini-preview (base) | no disponible (misma familia MiniLMv2-L6-H384) | no disponible | multilingue europeo | no disponible en la informacion | Modelo base sin poda de vocabulario; F2 0,94 en PIIMB ai4privacy (solo modelo), 0,46 en MAPA legal |
| nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large | no disponible (L6, H384) | no disponible | multilingue | no disponible en la informacion | Modelo de destilacion generalista, sin cabeza de PII especifica |

No se dispone de datos de benchmarks de otros modelos comparables de deteccion de PII en la informacion proporcionada.

## Limitaciones y advertencias

- El propio autor la califica como version "preview": debe usarse para marcar texto para revision humana, nunca como unica salvaguarda.
- Falsos negativos documentados: numeros de telefono y direcciones dictados, nombres foneticos o con errores ortograficos graves, algunos nombres compuestos en minusculas y titulos profesionales largos.
- Falsos positivos documentados: figuras publicas, nombres usados como marcas, mascotas o platos, y palabras comunes en posicion de nombre (52 de 60 en la prueba de palabras con forma de nombre).
- No marca materia sensible por si misma (salud, religion, politica); solo lo hace cuando identifica a una persona.
- Solo soporta bien texto en alfabeto latino.
- Un span que el modelo no marca no puede recuperarse revisando los spans marcados.
- La evaluacion solo con el modelo no equivale a un detector de CPR danes; los identificadores de formato fijo dependen de reglas de patrones y checksums externas.
- Reproducir las cifras publicadas requiere mas que el fichero ONNX: umbrales de confianza por tipo, filtrado de visibilidad, agrupacion de spans por offsets de bytes y ventanas de 480 tokens con solapamiento de 64.
- La decodificacion argmax simple genera mas spans de baja confianza que el pipeline completo.
- Uso fuera de alcance: anonimizacion automatica sin supervision para fines legales o regulatorios, y evaluacion de riesgo de reidentificacion.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base se usa y modifica con el acuerdo de BardsAI, lo que conviene verificar antes de redistribuir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermias-ai/da-pii-mini-preview-21m
- Demo en el navegador (Space): https://huggingface.co/spaces/ermias-ai/da-pii-mini-preview-21m-demo
- Modelo base: https://huggingface.co/bardsai/eu-pii-multi-mini-preview
- Modelo del que deriva el base: `nreimers/mMiniLMv2-L6-H384-distilled-from-XLMR-Large` (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
