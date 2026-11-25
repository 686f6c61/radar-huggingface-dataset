# elnemer7/ElNeMeR-Charity-Disaster-Donation-Fraud-ONNX

## Resumen

ElNeMeR-Charity-Disaster-Donation-Fraud-ONNX es un clasificador binario-multiclase exportado a formato ONNX, presentado por el autor Mahmoud ElNemer (ElNeMeR Digital Solutions & AI) como el modelo numero 18 de una supuesta flota de 25 modelos de IA forense y humanitaria. Su proposito declarado es detectar campanas de recaudacion de fondos fraudulentas que explotan imagenes generadas por IA de menores o pacientes enfermos, asi como monederos moviles personales no autorizados para recibir donaciones.

El modelo no es un modelo generativo ni un LLM: se trata de un clasificador que recibe un tensor de caracteristicas de 512 dimensiones (`features`, `float32`, `[batch_size, 512]`) y devuelve probabilidades sobre cuatro clases: informacion caritativa legitima, mendicidad medica o de orfanos falsa, explotacion de crisis generada por IA y recaudacion mediante monedero no licenciado. Se distribuye exclusivamente en formato ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` (WASM).

La relevancia del modelo es limitada y debe evaluarse con cautela: el repositorio de Hugging Face tiene 0 descargas y 0 likes, un tamano de 0.0 GB (lo que sugiere que no contiene pesos publicados o que estos son despreciables), y la model card afirma una "precision de calibracion del 100.00%" sin aportar ningun benchmark reproducible, dataset de evaluacion ni detalle sobre el entrenamiento. No se dispone de informacion sobre arquitectura interna, numero de parametros ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador con entrada `float32 [batch, 512]`; arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | no disponible (solo se distribuye en ONNX float32) |
| Idiomas soportados | no disponible (etiquetas de clase en ingles; tag `arabic-nlp` sugiere orientacion a arabe, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. La model card unicamente especifica el contrato de entrada y salida: un tensor `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de probabilidades sobre cuatro clases. El formato de exportacion es ONNX con opset 14, lo que permite ejecucion tanto en `onnxruntime` nativo como en `onnxruntime-web` mediante WebAssembly, es decir, inferencia en navegador.

No hay datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. La afirmacion de "Calibration Accuracy: 100.00%" en la model card no va acompanada de metodologia, conjunto de validacion ni metrica definida, por lo que no puede considerarse un resultado verificable. El tag `arabic-nlp` y el contexto del autor (Egipto, portal en arabe) apuntan a un enfoque sobre contenido en arabe, pero no se documenta la cobertura linguistica real.

## Capacidades

- Clasificacion de contenido en cuatro categorias: `legitimate_charity_info`, `fake_orphan_medical_begging`, `ai_crisis_exploitation` y `unlicensed_wallet_fundraising`.
- Entrada basada en caracteristicas precalculadas de 512 dimensiones, no en texto o imagen en bruto; requiere un pipeline externo de extraccion de features.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite despliegue del lado del cliente.
- Compatibilidad con `onnxruntime` en servidor para integracion en servicios backend.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision directa, tool calling ni comportamiento agentico.
- No se documenta soporte multilingue mas alla del tag `arabic-nlp`.

## Casos de uso

- Moderacion de campanas de donacion en plataformas de crowdfunding: el clasificador puede puntuar cada campana (a partir de features precalculadas) y marcar para revision humana aquellas con alta probabilidad en las clases 1, 2 o 3, reduciendo el volumen de revision manual.
- Filtrado previo en pasarelas de pago solidarias: integrado como paso de scoring antes de habilitar la recepcion de fondos, permite bloquear monederos personales no licenciados (clase 3) en flujos de onboarding.
- Triaje en ONG y organismos de respuesta a desastres: priorizacion de denuncias recibidas por canales de atencion, clasificando automaticamente los reportes ciudadanos de supuestas estafas.
- Analisis forense de redes sociales: procesamiento por lotes de publicaciones sospechosas para identificar patrones de explotacion de crisis con imagenes sinteticas, siempre que se disponga del extractor de features de 512 dimensiones adecuado.
- Despliegue en navegador para verificacion ciudadana: gracias a la exportacion WASM, puede ejecutarse en el cliente en herramientas de verificacion de campanas sin enviar datos a un servidor.
- Investigacion academica sobre fraude en donaciones: como linea base reproducible en formato ONNX para comparar con otros clasificadores, aunque la ausencia de datos de entrenamiento limita su valor como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra aportada por el autor es una "Calibration Accuracy" del 100.00%, sin definicion de metrica, conjunto de evaluacion ni comparacion con alternativas, por lo que no se reporta como benchmark valido.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio declara 0.0 GB, lo que impide estimar el tamano real de los pesos.
- GPU recomendadas: no aplica para un clasificador de este tipo; la inferencia ONNX puede ejecutarse en CPU.
- Cabe en cualquier GPU de consumo e incluso en CPU y en navegador via WASM, siempre que el modelo tenga el tamano implicito por el contrato de entrada (512 features).
- Opciones de despliegue: `onnxruntime` (Python, C++, C#), `onnxruntime-web` (WASM en navegador), `onnxruntime-node`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (deteccion de fraude en donaciones humanitarias) con los que establecer una comparacion de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre datos de entrenamiento, arquitectura y evaluacion: imposible auditar sesgos o validez del modelo.
- La cifra de "100.00% de precision de calibracion" no es verificable y debe tratarse como afirmacion de marketing, no como resultado tecnico.
- Repositorio sin descargas ni interacciones y con 0.0 GB de tamano: riesgo alto de que los pesos no esten realmente publicados o de que el artefacto este incompleto.
- Requiere un extractor de features externo de 512 dimensiones no especificado; sin el, el modelo no es utilizable de extremo a extremo.
- Riesgo de falsos positivos en contenido legitimo de emergencia humanitaria, con el dano reputacional y operativo que implica senalar como fraude a una organizacion real.
- Cobertura linguistica no documentada; el tag `arabic-nlp` sugiere un sesgo hacia contenido en arabe sin confirmacion.
- Licencia MIT permite uso comercial y modificacion, pero no exime de responsabilidad sobre las decisiones automatizadas tomadas con el modelo.
- No apto como unico criterio de decision en produccion: cualquier bloqueo o acusacion de fraude debe pasar por revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Charity-Disaster-Donation-Fraud-ONNX
- Plataforma forense humanitaria del autor: https://detector.elnemer-ai.com
- Portal corporativo del autor: https://elnemer-ai.com
