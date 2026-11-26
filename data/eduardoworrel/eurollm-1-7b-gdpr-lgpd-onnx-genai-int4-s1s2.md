# eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2

## Resumen

Este repositorio distribuye una compilación ONNX int4 de un especialista en privacidad construido sobre `utter-project/EuroLLM-1.7B-Instruct`, el modelo europeo de 1.700 millones de parámetros del proyecto UTTER. El autor, `eduardoworrel`, ha añadido una cabeza de decisión (pointer head) entrenada mediante LoRA para responder preguntas de transparencia sobre políticas de privacidad: dado un fragmento de texto y un requisito concreto, el modelo devuelve "sí" o "no" en un único forward pass, junto con una probabilidad y un margen. La compilación está pensada para ejecutarse en el navegador mediante `onnxruntime-genai` con WebGPU.

La innovación principal no es el modelo base, sino el patrón de despliegue S1S2 (System 1 / System 2): las decisiones tipadas se resuelven con una pasada rápida del cabezal (System 1) y solo cuando el margen de confianza es bajo se escala a generación de texto completa (System 2), reutilizando el mismo prefill. Esto permite clasificar políticas de privacidad con latencia mínima y coste computacional reducido en hardware de consumo.

El modelo cubre dos marcos regulatorios: el RGPD en inglés y la LGPD brasileña en portugués, con transferencia zero-shot evaluada sobre CCPA. Es relevante para desarrolladores que necesiten auditoría automatizada de políticas de privacidad en el cliente, sin enviar texto sensible a un servidor. La licencia es GPL-3.0, condicionada por el corpus de entrenamiento GDPR-Transparency-200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (EuroLLM-1.7B-Instruct) con cabeza de decisión pointer head añadida mediante LoRA |
| Parametros totales | 1.700 millones (modelo base); tamaño del repo 1,3 GB en int4 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | int4 (grafo ONNX para onnxruntime-genai 0.19, WebGPU) |
| Idiomas soportados | en, pt |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (onnxruntime-genai); existe variante alternativa en layout Transformers.js |

## Arquitectura y entrenamiento

El modelo parte de EuroLLM-1.7B-Instruct, un transformer decoder-only de 1.700 millones de parámetros desarrollado por el proyecto UTTER con licencia Apache-2.0. Sobre él se entrena un adaptador LoRA y una cabeza de decisión de tipo pointer head siguiendo la receta del proyecto Kev (Apache-2.0). La cabeza lee las representaciones del modelo y emite una distribución sobre las palabras de opción exactas con las que fue entrenada: " Yes" y " No" (con espacio inicial) en inglés, y " Sim" y " Não" en portugués. Cualquier otra palabra, incluidas traducciones, invalida el prompt que la cabeza espera leer.

Los datos de entrenamiento son tres corpus: GDPR-Transparency-200 (inglés, GPL-3.0, solo identificadores de ítems y scripts, sin redistribuir texto de políticas), el corpus Claudinha para LGPD en portugués (CC BY 4.0) y datos sintéticos Kev (legacy_policy, composicional, Apache-2.0). La variante principal, denominada "Kev-faithful", se entrena 2 épocas con la regla de learning rate de Kev y fusión en fp32; existe otra variante "joint" con 1 época y fusión en bf16 que rinde mucho peor. El patrón System 1 / System 2 y la compuerta por margen provienen de CT0 (Alias Robotics) y del paper "Browser Immune System" (arXiv 2611.15302).

## Capacidades

- Clasificación binaria tipada de requisitos de transparencia en políticas de privacidad, con salida estructurada (elección, probabilidad y margen) en un solo forward pass.
- Decisión System 1 rápida con escalado opcional a System 2 (generación de texto) cuando el margen cae por debajo de un umbral calibrado, reutilizando el mismo prefill.
- Generación de texto conversacional y de citas extractivas ("Quote the sentence that shows it") heredada del modelo base instruct.
- Soporte de múltiples preguntas por pasada (`decide` acepta una lista de preguntas), lo que permite evaluar varios requisitos de transparencia sobre el mismo fragmento.
- Transferencia zero-shot a CCPA en inglés, sin entrenamiento específico sobre ese marco.
- Ejecución íntegra en el navegador con WebGPU mediante `@s1s2/web`, sin backend servidor.
- Soporte bilingüe inglés/portugués con manifiestos separados (`manifest.en.json` para RGPD, `manifest.pt.json` para LGPD).

## Casos de uso

- Auditoría automatizada de políticas de privacidad en el navegador: un equipo legal o de compliance puede cargar un documento y comprobar en el cliente si aborda requisitos concretos del RGPD (por ejemplo, destinatarios de los datos), sin que el texto salga del dispositivo.
- Triaje previo a revisión humana: el cabezal clasifica cientos de pasajes y solo los de margen bajo se escalan a System 2 o a un revisor humano, reduciendo el coste de revisión de corpus grandes de políticas.
- Verificación de transparencia en portugués para LGPD: el manifiesto `manifest.pt.json` permite aplicar el mismo flujo a políticas brasileñas con las palabras de opción " Sim"/" Não".
- Extensiones de navegador o widgets web de privacidad: al ejecutarse con WebGPU y un grafo ONNX de 1,31 GB, puede integrarse en una extensión que analice la política de un sitio mientras el usuario navega.
- Investigación sobre marcos regulatorios: la transferencia zero-shot a CCPA (75,2 % de balanced accuracy en fp32) permite estudiar hasta qué punto un modelo entrenado en RGPD generaliza a otros regímenes.
- Generación de citas justificativas: tras una decisión positiva, System 2 puede extraer la frase exacta que evidencia el cumplimiento, útil para informes de auditoría trazables.
- Filtrado previo en pipelines de compliance documental: descartar rápidamente pasajes que no abordan un requisito antes de pasarlos a un modelo mayor o a un revisor.

## Benchmarks y rendimiento

Resultados publicados en la model card. La primera tabla corresponde a pesos fp32 PyTorch de la variante Kev-faithful sobre el conjunto de test reservado; la segunda, a esta compilación int4 medida en navegador (Chrome WebGPU, Mac M2 Pro) sobre el split de desarrollo y marcada como preliminar.

| Conjunto | Balanced accuracy fp32 (%) | Balanced accuracy int4 en navegador (%) |
|---|---|---|
| GDPR (inglés) | 83,0 (n = 558) | 81,9 (dev) |
| LGPD (portugués) | 79,4 (n = 802) | 81,3 (dev) |
| CCPA (inglés, zero-shot) | 75,2 (n = 420) | 76,7 (dev) |

La variante "joint" int4 medida en navegador sobre test reservado obtiene GDPR 52,9 / LGPD 53,7 / CCPA 52,9, muy por debajo de la variante Kev-faithful. Los registros de fidelidad sobre 1.112 preguntas de desarrollo indican que la decisión coincide con el modelo fp32 en el 91,5 % de los casos con lectura por cabeza (intervalo del 95 %: 89,8–93,0) y en el 95,2 % con lectura por logits.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el grafo int4 ocupa 1,31 GB de descarga, por lo que el consumo en memoria es del orden de unos pocos GB incluyendo buffers de WebGPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU; probado en Apple M2 Pro. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, al ser un modelo de 1,7B en int4 y ejecutarse vía WebGPU en el navegador.
- Opciones de despliegue: `onnxruntime-genai` 0.19 con WebGPU a través de `@s1s2/web`; existe una variante en layout Transformers.js. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (EuroLLM-1.7B GDPR/LGPD int4) | 1,7B | no disponible | Clasificación tipada de requisitos de privacidad, System 1/2, navegador | GPL-3.0 | Hugging Face, ONNX int4 |
| utter-project/EuroLLM-1.7B-Instruct | 1,7B | no disponible | Modelo instruct generalista multilingüe europeo | Apache-2.0 | Hugging Face |
| aliasrobotics/alias3-web | no disponible | no disponible | Sistema inmunitario en navegador (precursor del patrón S1S2) | no disponible | Hugging Face |
| Modelos de clasificación de políticas de privacidad genéricos | no disponible | no disponible | Clasificación textual sin cabezal tipado | no disponible | no disponible |

La comparación con alternativas específicas de clasificación de políticas de privacidad no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo indica si un pasaje aborda un requisito de transparencia, no si una política cumple la normativa; no constituye asesoramiento legal.
- Entrenado sobre políticas RGPD en inglés y LGPD en portugués; CCPA nunca se usó en entrenamiento y solo se evalúa como transferencia zero-shot.
- La cabeza solo funciona con las palabras de opción exactas del manifiesto (" Yes"/" No" y " Sim"/" Não"); traducciones u otras variantes rompen la inferencia.
- La variante "joint" rinde cerca del azar (en torno al 53 %) y no debe confundirse con la variante Kev-faithful.
- Los resultados int4 en navegador son preliminares y medidos sobre el split de desarrollo, no sobre test reservado.
- Licencia GPL-3.0 impuesta por el corpus GDPR-Transparency-200; el uso comercial queda sujeto a las obligaciones de esa licencia, pese a que el modelo base es Apache-2.0.
- Riesgo de alucinación en la fase System 2 (generación de citas), ya que se apoya en el modelo base instruct.
- Idiomas limitados a inglés y portugués; no se documenta soporte de otros idiomas europeos del modelo base.
- No se documentan sesgos específicos ni la longitud de contexto efectiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-genai-int4-S1S2
- Adaptador LoRA y cabezas en PyTorch: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-LoRA
- Variante Transformers.js: https://huggingface.co/eduardoworrel/EuroLLM-1.7B-GDPR-LGPD-ONNX-transformersjs-S1S2
- Modelo base: https://huggingface.co/utter-project/EuroLLM-1.7B-Instruct
- Repositorio s1s2: https://github.com/eduardoworrel/s1s2
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
- GDPR-Transparency-200 (privacy-policy-annotator): https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta de pointer head Kev: https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
