# elnemer7/ElNeMeR-SIMSwap-BankImpersonation-SocialEng-ONNX

## Resumen

ElNeMeR-SIMSwap-BankImpersonation-SocialEng-ONNX es un clasificador binario-multiclase exportado a formato ONNX, desarrollado por el ingeniero Mahmoud ElNemer dentro de su flota de 35 modelos forenses y humanitarios ("Sovereign & Humanitarian Forensic AI Fleet"). El modelo aborda un problema muy concreto de seguridad bancaria y de telecomunicaciones: la deteccion de guiones de llamada (scripts) que suplantan a departamentos de fraude de bancos centrales para solicitar codigos CVV u OTP, asi como ataques de SIM-swap y desvio de llamadas mediante codigos `*21*`.

Tecnicamente no es un modelo generativo de lenguaje, sino un clasificador que recibe un vector de caracteristicas de entrada de 512 dimensiones en `float32` y devuelve probabilidades sobre tres clases: aviso de seguridad oficial, vishing bancario con peticion de CVV/OTP y ataque de reenvio/SIM-swap de telecomunicaciones. Su empaquetado en ONNX (opset 14) permite ejecucion tanto en `onnxruntime` como en `onnxruntime-web` mediante WASM, lo que facilita su integracion en navegador o en pipelines ligeros del lado servidor.

El modelo es relevante en el contexto actual de fraude telefonico automatizado, donde los atacantes combinan ingenieria social con tecnicas de SIM-swap para eludir la autenticacion por SMS. Al ser un clasificador pequeno y de licencia MIT, puede desplegarse como filtro previo en centralitas virtuales, sistemas antifraude o pasarelas de telefonia IP. La model card no aporta informacion sobre el tamano del repo (0.0 GB), el numero de parametros ni los datos de entrenamiento, lo que limita la evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (clasificador exportado a ONNX, opset 14) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de vector `[batch_size, 512]`) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14, compatible con `onnxruntime` y `onnxruntime-web` WASM) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del clasificador: no se especifica si se trata de una red densa (MLP), un transformer pequeno o un modelo lineal sobre caracteristicas precalculadas. Lo unico documentado es la interfaz de inferencia: una entrada `features` de tipo `float32` con forma `[batch_size, 512]` y una salida `probabilities` sobre tres clases. El modelo se distribuye exclusivamente como grafo ONNX en opset 14, pensado para ejecucion ligera.

Tampoco se documentan el volumen ni la composicion del dataset de entrenamiento, ni si se aplicaron tecnicas de ajuste fino, aumento de datos o calibracion post-entrenamiento. La model card declara una "Calibration Accuracy" del 100,00 %, pero no se especifica la metrica exacta, el conjunto de evaluacion ni el tamano de la muestra, por lo que ese valor no debe interpretarse como una medida de rendimiento generalizable.

## Capacidades

- Clasificacion de texto o caracteristicas de llamada en tres categorias: `official_security_advisory`, `bank_officer_cvv_otp_vishing` y `telecom_simswap_forwarding_attack`.
- Deteccion de guiones de suplantacion de departamentos de fraude bancario que solicitan CVV u OTP.
- Deteccion de ataques de SIM-swap y de reenvio de llamadas mediante codigos `*21*`.
- Inferencia en navegador mediante `onnxruntime-web` (WASM) y en servidor mediante `onnxruntime`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta capacidad multilingue; los idiomas soportados figuran como no disponibles.

## Casos de uso

- Filtrado previo en centralitas virtuales (PBX/IP): el clasificador puede puntuar la transcripcion o las caracteristicas de cada llamada entrante y marcar como sospechosas aquellas que encajen con el patron de vishing bancario, derivandolas a un agente humano o a un aviso automatico.
- Proteccion de clientes en banca movil: integrado en la app o en el backend, puede alertar al usuario cuando una llamada entrante coincide con el patron de solicitud de CVV/OTP por parte de un supuesto "departamento de fraude".
- Monitorizacion antifraude en operadores de telefonia: deteccion de intentos de activacion de reenvio incondicional (`*21*`) o de SIM-swap a partir de las caracteristicas de la sesion, para bloquear la operacion antes de que se complete.
- Analisis forense post-incidente: clasificacion de transcripciones o registros de llamadas recopilados tras una denuncia, para etiquetar automaticamente los casos de ingenieria social y priorizar la investigacion.
- Formacion y simulacion de phishing telefonico: uso del clasificador para evaluar si los guiones de concienciacion se parecen demasiado a un ataque real, o para generar alertas en ejercicios de red team.
- Despliegue en navegador para verificacion ciudadana: al compilarse a WASM, puede integrarse en una web de consulta donde el usuario pegue el texto de una llamada sospechosa y obtenga una clasificacion orientativa.
- Enriquecimiento de SIEM/SOAR: como paso de un pipeline de automatizacion, las probabilidades de salida pueden alimentar reglas de correlacion y disparar flujos de respuesta ante incidentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada es una "Calibration Accuracy" del 100,00 % en la model card, sin especificar conjunto de evaluacion, tamano de muestra ni metodologia, por lo que no se presenta como benchmark comparable.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamano del repo figura como 0.0 GB y no se indica el numero de parametros. Por la forma de la entrada (`[batch_size, 512]`) y el caracter de clasificador, se espera un consumo muy bajo, pero no puede cuantificarse con los datos aportados.
- GPU recomendadas: no disponibles. Un clasificador de este tipo es probable que funcione en CPU sin problema, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; previsiblemente si, dado el formato ONNX y la entrada de 512 dimensiones, pero sin datos verificables.
- Opciones de despliegue: `onnxruntime` (Python/C++/C#) y `onnxruntime-web` con backend WASM para navegador, segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores ONNX de vishing/SIM-swap) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parametros, datos de entrenamiento ni metodologia de evaluacion, lo que impide auditar el modelo y reproducir sus resultados.
- La cifra de "Calibration Accuracy: 100,00 %" carece de contexto (conjunto, tamano, metrica) y no debe tomarse como garantia de rendimiento en produccion.
- No se especifican los idiomas soportados; un detector de guiones de vishing depende criticamente del idioma y la jerga local, por lo que su validez fuera del idioma de entrenamiento es desconocida.
- Riesgo de falsos positivos y negativos no cuantificado: no hay matriz de confusion ni curvas ROC/PR publicadas.
- La entrada es un vector de 512 caracteristicas; el modelo no procesa texto bruto por si mismo, de modo que la calidad depende por completo del extractor de caracteristicas que lo precede, no documentado.
- Posible riesgo de alucinacion no aplica (no es generativo), pero si de sobreconfianza en las probabilidades de salida si la calibracion no esta verificada de forma independiente.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no exime de responsabilidad al integrador; conviene revisar el aviso legal de la plataforma del autor.
- El modelo se presenta como parte de una flota de 35 modelos con sellos de "verificacion" del autor; se recomienda tratar esas declaraciones como marketing y validar el modelo con datos propios antes de usarlo en produccion.
- No se documentan sesgos conocidos; al no conocerse el dataset, no puede descartarse un sesgo hacia determinados patrones linguisticos o regionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-SIMSwap-BankImpersonation-SocialEng-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
