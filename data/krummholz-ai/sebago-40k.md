# krummholz-ai/Sebago-40K

## Resumen

Sebago 40K es un modelo de lenguaje de dominio muy restringido desarrollado por Krummholz AI LLC (Belfast, Maine) y publicado el 24 de noviembre de 2026 bajo licencia Apache 2.0. No es un modelo de propósito general: su única tarea es leer un campo concreto de un registro estructurado de medidas de campo y devolver su valor, o abstenerse cuando el campo solicitado no está presente. Está entrenado desde cero, sin inicialización a partir de otro modelo, y su diseño prioriza la ejecución en dispositivo (on-device) sin conectividad.

La arquitectura es un transformer causal de solo 2 capas, 4 cabezas de atención, anchura 48 y anchura feed-forward 96, con 40.530 parámetros entrenables. El vocabulario consta de 18 símbolos: seis claves de campo y ocho símbolos de valor, más delimitadores. La entrada es de 14 tokens (una clave solicitada, tres pares campo/valor y un delimitador de respuesta) y la salida es de tres símbolos de valor más un token de fin, o un token de abstención más un token de fin.

Su relevancia es acotada pero ilustrativa: demuestra que un modelo de 40.530 parámetros, empaquetado en un checkpoint de 164.616 bytes en safetensors float32, puede resolver una tarea de extracción estructurada con verificación determinista en el navegador, sin GPU y sin red. No sustituye a un LLM generalista ni compite con él; es un componente especializado para lectura de registros en campo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal, 2 capas, 4 cabezas de atencion, anchura 48, anchura feed-forward 96 |
| Parametros totales | 40.530 parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 14 tokens de entrada (una clave solicitada, tres pares campo/valor y un delimitador de respuesta) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en float32) |
| Idiomas soportados | no disponible como idioma natural; el vocabulario es un conjunto de 18 simbolos y la interfaz de la app esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float32 (164.616 bytes incluida la cabecera) |

## Arquitectura y entrenamiento

El modelo es un transformer causal minimo entrenado desde cero, con inicializacion independiente por parte de Krummholz AI. La tarea se formula como generacion autorregresiva sobre un vocabulario simbolico de 18 elementos: seis claves de campo, ocho simbolos de valor y tokens auxiliares (delimitador de respuesta, fin y abstencion). La entrada completa son 14 tokens y la salida son tres simbolos de valor mas un token de fin, o bien un token de abstencion mas un token de fin.

El entrenamiento uso 72.000 ejemplos generados programaticamente, la mitad respondibles y la mitad con el campo solicitado ausente. Se empleo AdamW con tasa de aprendizaje 0,0015, tamano de lote 48 y 1.500 actualizaciones, con semilla 271124, dos hilos de CPU, Python 3.13 y PyTorch 2.14.1. El generador de registros uso 416 de los 512 valores de tres simbolos posibles para entrenamiento y reservo los otros 96 para evaluacion. No se usaron textos web ni datos de campo de clientes. No se documenta RLHF, DPO ni ninguna fase de alineacion adicional.

## Capacidades

- Lectura de un campo solicitado en un registro estructurado corto y devolucion de su valor en forma de tres simbolos.
- Abtencion explicita cuando el campo solicitado no esta presente en el registro visible.
- Distincion entre valor presente bajo otra clave y valor ausente: si se sustituye la clave del campo solicitado, el valor deja de considerarse soportado aunque siga en el registro.
- Ejecucion en CPU con PyTorch y con el decodificador incluido en el navegador.
- Verificacion determinista en la app: cada respuesta generada se contrasta con el campo solicitado visible antes de mostrarse.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni interfaz de lenguaje general. El menu de la app define las preguntas que puede responder.

## Casos de uso

- Encuestas limnologicas en lagos: el modelo lee la temperatura del agua u otra medida de un registro de campo y devuelve el valor, o indica que el campo falta, sin necesidad de conectividad en la orilla.
- Inventario forestal: lectura de mediciones registradas en parcelas (por ejemplo, diametro o altura) desde un dispositivo movil con la app instalada y cacheada para uso offline.
- Desembarques pesqueros: extraccion de una medida concreta de un parte de capturas estructurado en cubierta, donde no hay red disponible.
- Verificacion de registros incompletos: cuando el campo solicitado no aparece, el modelo abstiene y la app pide al operario revisar el registro, lo que ayuda a detectar formularios mal cumplimentados.
- Despliegue en navegador sin backend: el checkpoint de 164.616 bytes y el decodificador en JavaScript permiten ejecutar la inferencia en Edge, Chrome, Firefox o Safari en escritorio y movil, con recarga desde cache sin red.
- Integracion como componente de validacion: dado su coste computacional minimo (40.530 parametros en CPU), puede incrustarse en flujos de captura de datos para comprobar que el valor leido coincide con la clave solicitada antes de persistirlo.
- Formacion y demostracion: por su tamano y su entrenamiento reproducible (train.py, semilla y hiperparametros documentados), sirve como ejemplo didactico de transformer causal desde cero para tareas de extraccion estructurada.

## Benchmarks y rendimiento

| Medida en held-out | Pesos iniciales | Pesos entrenados |
|---|---:|---:|
| Copio el valor suministrado exactamente | 0/512 | 511/512 |
| Se abstuvo cuando el campo estaba ausente | 0/512 | 512/512 |
| Acerto ambas mitades del par | 0/512 | 511/512 |

La evaluacion uso 512 pares y 95 valores solicitados distintos del conjunto reservado; ambas mitades de cada par contienen los mismos tres valores. El unico error consistio en la sustitucion de un solo simbolo. El modelo del navegador coincidio con PyTorch en las 1.024 completaciones de held-out. En los tres registros ficticios incluidos en la app, devolvio el resultado esperado en las 96 combinaciones de campo seleccionado y visibilidad de campos; esta segunda medida incluye ademas la verificacion determinista de la app, por lo que mide una cosa distinta de la evaluacion de los pesos.

## Requisitos de hardware

- VRAM estimada: no aplica; el checkpoint ocupa 164.616 bytes en float32 y la inferencia se ejecuta en CPU.
- GPU recomendadas: ninguna; el modelo esta pensado para CPU y para el decodificador del navegador.
- Cabe en cualquier GPU consumer y en cualquier CPU moderna; el requisito practico es un navegador actual (Edge, Chrome, Firefox o Safari) o un entorno PyTorch en CPU.
- Opciones de despliegue: PyTorch en CPU, el decodificador JavaScript incluido (model.js) dentro de la app HTML autocontenida, y la web app instalable en Android (Chrome, Anadir a pantalla de inicio) e iOS (Safari, Anadir a pantalla de inicio, con Open as Web App si se ofrece).
- Latencia y throughput: no disponible en la informacion proporcionada. El autor indica que verifico la app en Edge sobre Windows en tamanos de escritorio y telefono, incluida una recarga desde cache con la red desactivada, pero no publica cifras de latencia.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (lectores de registros estructurados de 40.530 parametros entrenados desde cero). Las alternativas habituales serian LLM generalistas de mayor tamano, pero no se dispone de datos de comparacion en la informacion facilitada y no se inventan cifras.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no tiene interfaz de texto libre, imagen ni voz. El menu de la app define las preguntas que puede responder.
- Entrenado y evaluado con una unica gramatica simbolica y una unica inicializacion; el rendimiento esperado con un esquema de campos nuevo requiere su propia prueba de held-out.
- Un valor devuelto puede ser incorrecto si la medicion de origen es incorrecta; la verificacion de la app comprueba la coherencia con el campo visible, no la veracidad de la medida.
- La evaluacion held-out registro 1 error de 512 en la copia exacta del valor (sustitucion de un solo simbolo), por lo que existe una tasa de error residual no nula.
- Sesgos conocidos: no documentados en la informacion disponible. El entrenamiento no uso textos web ni datos de clientes, lo que reduce el riesgo de sesgo de corpus pero tambien limita la generalizacion.
- Idiomas: el vocabulario es simbolico y la interfaz de la app esta en ingles; no se documenta soporte multilingue.
- Licencia Apache 2.0, que permite uso comercial; el autor no impone restricciones adicionales en la model card.
- El rendimiento fisico en dispositivos iOS, Android, macOS y Linux no esta verificado segun la model card (el texto se interrumpe en ese punto); la verificacion documentada se limita a Edge sobre Windows en dos tamanos de ventana.
- Las listas en App Store y Google Play estaban planificadas para las semanas siguientes a la publicacion; no se confirma su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/krummholz-ai/Sebago-40K
- App: https://krummholz.ai/apps/sebago/
- Pagina del modelo: https://krummholz.ai/llms/sebago/
- Field notes: https://krummholz.ai/field-notes/sebago-field-reader/
- Pesos entrenados: https://huggingface.co/krummholz-ai/Sebago-40K/resolve/main/sebago-40k.safetensors?download=true
- Inicializacion aleatoria: https://huggingface.co/krummholz-ai/Sebago-40K/resolve/main/sebago-init.safetensors?download=true
- App de escritorio offline (ZIP): https://huggingface.co/krummholz-ai/Sebago-40K/resolve/main/Sebago-offline.zip?download=true
- Web app bundle (ZIP): https://huggingface.co/krummholz-ai/Sebago-40K/resolve/main/Sebago-web-app.zip?download=true
- HTML unico: https://huggingface.co/krummholz-ai/Sebago-40K/resolve/main/Sebago.html?download=true
- Guia de instalacion: INSTALL.txt
- Sumas de verificacion: SHA256SUMS
- Programa de entrenamiento: train.py
- Resultados por caso: evaluation.json
- Inferencia en navegador: model.js
