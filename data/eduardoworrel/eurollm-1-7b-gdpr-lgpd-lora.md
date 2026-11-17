# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-LoRA

## Resumen

EuroLLM-1.7B GDPR + LGPD privacy specialist es un adaptador LoRA con cabeza de punteros (pointer head) construido sobre el modelo base utter-project/EuroLLM-1.7B-Instruct, desarrollado por el usuario eduardoworrel. El modelo resuelve una tarea muy concreta: dada una cláusula de una política de privacidad y un requisito de transparencia, responde Sí/No en un único forward pass, devolviendo además una probabilidad y un margen de confianza. No es un modelo generativo de propósito general, sino un clasificador especializado en verificar si un texto aborda o no un requisito regulatorio concreto.

La relevancia del modelo reside en su enfoque de eficiencia: en lugar de generar texto con un LLM para responder preguntas binarias, utiliza una cabeza de atención tipo pointer que calcula P(opción) = softmax_k(q(h_decide) · k(h_option_end) / 16), lo que permite clasificación determinista y rápida con umbrales de confianza explícitos. El adaptador está entrenado sobre datos de GDPR (inglés) y LGPD (portugués brasileño), con transferencia zero-shot a CCPA (inglés).

El modelo tiene 1.700 millones de parámetros en su base, soporta inglés y portugués, y se distribuye como adaptador PEFT (LoRA) más un fichero de cabeza en safetensors, con un tamaño de repositorio de 0,1 GB. Su licencia es GPL-3.0, heredada de los datos de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EuroLLM-1.7B-Instruct) + adaptador LoRA + pointer head |
| Parametros totales | 1.700 millones (modelo base); adaptador LoRA y cabeza adicionales de tamaño no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (merge), fp32 (variante joint_k); versión ONNX int4 disponible en repo separado |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (LoRA + head.safetensors), PEFT |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct, un transformer decoder-only de 1.700 millones de parámetros. Sobre él se aplica un adaptador LoRA y una cabeza de punteros que opera sobre las representaciones ocultas: la probabilidad de cada opción se calcula como softmax sobre el producto escalar entre una query derivada del token de decisión (h_decide) y las keys derivadas del final de cada opción (h_option_end), escalado por 16. La cabeza tiene dimensión 256 en las proyecciones q y k.

El entrenamiento se realizó sobre tres fuentes: GDPR-Transparency-200 (inglés, GPL-3.0), el corpus Claudinha de políticas brasileñas para LGPD (portugués, CC BY 4.0, un anotador por cláusula) y datos sintéticos Kev (legacy_policy, composicional). Se documentan dos variantes: joint_k (2 épocas, merge en fp32) y joint (1 época, merge en bf16), con resultados muy dispares entre ambas. Las palabras de opción están fijadas exactamente a " Yes"/" No" en inglés y " Sim"/" Não" en portugués, con espacio inicial incluido; cualquier otra palabra o traducción altera el prompt y rompe la cabeza. El modelo incorpora la idea de separación System 1 / System 2 y compuerta de margen procedente de CT0 (Alias Robotics).

## Capacidades

- Clasificación binaria de cumplimiento de transparencia: dada una cláusula y un requisito, responde Sí/No con probabilidad y margen.
- Clasificación en un único forward pass, sin generación autoregresiva.
- Soporte de dos idiomas: inglés (GDPR) y portugués (LGPD).
- Transferencia zero-shot a CCPA en inglés (sin entrenamiento específico).
- Salida con umbral de confianza (margin gate) que permite derivar a un modo System 2 bajo demanda.
- Versión desplegable en navegador vía ONNX int4 y WebGPU (repo separado S1S2).
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso general.

## Casos de uso

- Auditoría automatizada de políticas de privacidad: procesar cláusulas de políticas web y verificar si abordan requisitos concretos de transparencia del GDPR, usando la probabilidad y el margen para priorizar revisiones humanas.
- Cumplimiento LGPD en Brasil: analizar políticas en portugués con el mismo pipeline, aprovechando el corpus Claudinha y la salida binaria con confianza.
- Triaje previo a revisión legal: clasificar grandes volúmenes de cláusulas y derivar solo las de margen bajo a revisión humana, reduciendo coste por documento.
- Monitorización continua de cambios en políticas: ejecutar el clasificador sobre versiones nuevas de políticas y detectar regresiones en la cobertura de requisitos de transparencia.
- Evaluación comparativa entre jurisdicciones: usar la transferencia zero-shot a CCPA para estimar cobertura en marcos no entrenados y detectar brechas.
- Despliegue en navegador para verificación en cliente: la variante ONNX int4 con WebGPU permite clasificar cláusulas localmente sin enviar texto a servidores, útil en contextos de privacidad estricta.
- Generación de datasets etiquetados: usar las salidas del modelo como preetiquetado para construir corpus de cumplimiento a mayor escala, con revisión posterior.

## Benchmarks y rendimiento

Conjunto de test held-out, balanced accuracy de la cabeza de punteros, pesos fp32, variante joint_k (2 épocas, merge fp32):

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 83,0 |
| LGPD (portugués), n = 802 | 79,4 |
| CCPA (inglés, zero-shot), n = 420 | 75,2 |

Variante joint (1 época, merge bf16): GDPR 53,2 / LGPD 53,7 / CCPA 54,8. La diferencia entre variantes (83,0 frente a 53,2 en GDPR) indica una alta sensibilidad al régimen de entrenamiento y al tipo de merge.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo base de 1.700 millones requiere aproximadamente 3,4 GB de pesos más overhead de activaciones y cabeza; en fp32, en torno a 6,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4090); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 Ti o superiores para bf16; la variante ONNX int4 reduce aún más el requisito y permite ejecución en navegador con WebGPU.
- Opciones de despliegue: transformers + PEFT (merge_and_unload), ONNX Runtime (variante int4), WebGPU en navegador; vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un único forward pass sin generación, la latencia esperada es baja, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM-1.7B GDPR+LGPD LoRA | 1.700 M (base) + adaptador | no disponible | Clasificación binaria de transparencia | GPL-3.0 | Hugging Face, ONNX int4 |
| EuroLLM-1.7B-Instruct (base) | 1.700 M | no disponible | Generación de propósito general | Apache-2.0 | Hugging Face |
| alias3-web (Alias Robotics) | no disponible | no disponible | Precursores de System 1/System 2 | no disponible | Hugging Face |

No se dispone de comparativas con clasificadores especializados de cumplimiento normativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito de transparencia, no si la política cumple la ley; no constituye asesoramiento legal.
- Entrenado solo con políticas de aplicaciones (GDPR, inglés) y políticas brasileñas (LGPD, portugués, un anotador por cláusula); CCPA nunca se usó en entrenamiento.
- Las palabras de opción están fijadas exactamente (" Yes"/" No", " Sim"/" Não"); traducciones u otras variantes rompen la cabeza.
- Alta sensibilidad a la variante de entrenamiento: la diferencia entre joint_k (83,0 % en GDPR) y joint (53,2 %) sugiere que un merge o número de épocas distinto degrada gravemente el rendimiento.
- Licencia GPL-3.0 por los datos GDPR-Transparency-200, lo que impone restricciones de copyleft para uso comercial y redistribución.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos/negativos en la clasificación, especialmente en dominios no cubiertos.
- Un solo anotador por cláusula en LGPD, lo que puede introducir sesgo de anotación.
- No soporta tool calling, agentes ni razonamiento multi-paso; su uso fuera de la clasificación binaria no está previsto.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-LoRA
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Versión ONNX int4 S1S2: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- Repo GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Repo Kev (pointer head y receta): https://github.com/jaredpalmer/kev
- Predecesor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
