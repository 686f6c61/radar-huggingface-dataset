# eduardoworrel/S5-nano-GDPR-LGPD-LoRA

## Resumen

S5-nano GDPR + LGPD es un adaptador LoRA con cabeza de puntero (pointer head) construido sobre el modelo base maritaca-ai/S5-nano, desarrollado por el usuario eduardoworrel. Resuelve una tarea muy concreta de clasificación textual: dado un fragmento de una política de privacidad y un requisito de transparencia, el modelo responde "Yes"/"No" (en inglés) o "Sim"/"Não" (en portugués) en un único forward pass, devolviendo además una probabilidad y un margen de confianza. No es un modelo generativo de propósito general, sino un clasificador especializado que reutiliza las representaciones internas del modelo base.

El interés técnico reside en su diseño: en lugar de generar texto libre, emplea una cabeza de atención tipo pointer (con proyecciones q y k de dimensión 256) que calcula P(opción) = softmax_k(q(h_decide) · k(h_option_end) / 16). El adaptador se distribuye como pesos PEFT en safetensors y existe un hermano ONNX int4 pensado para ejecución en navegador vía WebGPU mediante la librería s1s2, lo que lo sitúa en la línea de sistemas de privacidad "on-device".

El modelo cubre dos marcos regulatorios: GDPR en inglés y LGPD en portugués, con transferencia zero-shot observada a CCPA. La licencia es GPL-3.0, condicionada por el dataset de entrenamiento GDPR-Transparency-200, lo que restringe su uso comercial. El repositorio es pequeño (0,1 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (maritaca-ai/S5-nano) + adaptador LoRA + cabeza de puntero (pointer head, q/k de dimensión 256) |
| Parametros totales | no disponible (el adaptador LoRA y la cabeza son de tamaño reducido; el recuento del modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors (fp32/bf16 según variante); existe variante ONNX int4 para navegador |
| Idiomas soportados | en (GDPR), pt (LGPD); transferencia zero-shot observada a CCPA en inglés |
| Licencia | GPL-3.0 |
| Formato de pesos | safetensors (PEFT/LoRA + head.safetensors); variante ONNX int4 en repo hermano |

## Arquitectura y entrenamiento

El sistema se compone de tres piezas: el modelo base S5-nano de Maritaca AI (Apache-2.0), un adaptador LoRA entrenado sobre él y una cabeza de puntero que opera sobre los estados ocultos. La clasificación no se obtiene por generación de tokens, sino calculando un producto escalar entre la representación del punto de decisión (h_decide) y la representación del final de cada opción candidata (h_option_end), normalizado por la raíz de la dimensión (16) y pasado por softmax. Esto permite obtener una probabilidad calibrada y un margen en un solo forward pass.

El entrenamiento combina tres fuentes: GDPR-Transparency-200 (inglés, GPL-3.0, solo identificadores de ítems y scripts, sin redistribuir texto de políticas), el corpus Claudinha para LGPD (portugués, CC BY 4.0, un anotador por cláusula) y datos sintéticos Kev (legacy_policy, composicional, Apache-2.0). Se documentan dos variantes: `joint_k` (2 épocas, merge en fp32) y `joint` (1 época, merge en bf16). La idea de separación System 1 / System 2 y la compuerta por margen proceden de CT0 (Alias Robotics) y del paper Browser Immune System.

## Capacidades

- Clasificación binaria Yes/No de si un fragmento de política de privacidad aborda un requisito de transparencia concreto.
- Salida con probabilidad y margen de confianza en un único forward pass, sin generación autoregresiva.
- Soporte bilingüe: inglés (GDPR) y portugués (LGPD).
- Transferencia zero-shot a CCPA en inglés, sin entrenamiento específico sobre ese marco.
- Ejecución en navegador mediante la variante ONNX int4 y WebGPU (patrón S1S2 con respuesta tipada, margen y System 2 bajo demanda).
- Integración como adaptador PEFT sobre el modelo base, con posibilidad de merge_and_unload.
- No soporta tool calling, agentes multi-paso ni capacidades multimodales (visión, audio).

## Casos de uso

- Auditoría automatizada de políticas de privacidad: procesar cláusulas de una política GDPR o LGPD y determinar si abordan requisitos de transparencia concretos, generando un informe por requisito con probabilidad y margen.
- Triaje previo a revisión legal: filtrar automáticamente los fragmentos que no abordan un requisito y escalar solo los casos ambiguos (margen bajo) a revisión humana, reduciendo carga del equipo jurídico.
- Cumplimiento en aplicaciones web: desplegar la variante ONNX int4 en el navegador para verificar políticas de terceros sin enviar texto a servidores externos, preservando la privacidad del usuario.
- Monitorización continua de cambios: reejecutar la clasificación cuando una política se actualiza y detectar regresiones en la cobertura de requisitos de transparencia.
- Investigación comparada de marcos regulatorios: usar la transferencia zero-shot a CCPA para estudiar solapamientos entre GDPR, LGPD y CCPA sobre el mismo corpus.
- Construcción de datasets etiquetados: generar etiquetas Yes/No con confianza sobre grandes volúmenes de políticas para preanotar corpus de investigación en privacidad.
- Docencia y formación en protección de datos: ejemplificar con casos reales qué significa que una cláusula "aborde" un requisito de transparencia frente a que la política "cumpla" la ley.

## Benchmarks y rendimiento

Conjunto de test held-out, balanced accuracy de la cabeza de puntero, pesos fp32, variante `joint_k` (2 épocas, merge fp32):

| Conjunto | Balanced accuracy (%) |
|---|---|
| GDPR (inglés), n = 558 | 89,4 |
| LGPD (portugués), n = 802 | 83,4 |
| CCPA (inglés, transferencia zero-shot), n = 420 | 82,9 |

Variante alternativa `joint` (1 época, merge bf16): GDPR 87,1 / LGPD 80,5 / CCPA 81,2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el adaptador ocupa 0,1 GB y el modelo base S5-nano es de escala reducida (etiqueta "nano"), por lo que se espera un consumo moderado.
- GPU recomendadas: no disponible; por el tamaño del modelo base, es probable que funcione en GPUs consumer, aunque no se documenta.
- Ejecución en navegador: variante ONNX int4 con WebGPU, sin necesidad de GPU dedicada en servidor.
- Opciones de despliegue: transformers + PEFT (merge_and_unload), ONNX Runtime Web (WebGPU) vía librería s1s2.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| S5-nano GDPR-LGPD-LoRA | Clasificador binario con pointer head sobre S5-nano | en, pt | no disponible | GDPR 89,4 / LGPD 83,4 / CCPA 82,9 (balanced accuracy) | GPL-3.0 |
| maritaca-ai/S5-nano (base) | Modelo generativo base | no disponible | no disponible | no disponible | Apache-2.0 |
| aliasrobotics/alias3-web | Precursor, sistema de privacidad en navegador | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre políticas de aplicaciones (GDPR, inglés) y políticas brasileñas (LGPD, portugués, un anotador por cláusula); CCPA nunca fue parte del entrenamiento.
- El modelo indica si un fragmento aborda un requisito de transparencia, no si la política cumple la ley; no constituye asesoramiento legal.
- Las palabras de opción están fijadas: "Yes"/"No" en inglés y "Sim"/"Não" en portugués; traducciones u otras variantes alteran el prompt y no funcionan.
- Licencia GPL-3.0 por herencia del dataset GDPR-Transparency-200; restringe el uso comercial y exige cumplir las condiciones de copyleft.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificación errónea en fragmentos ambiguos o fuera de dominio; el margen permite filtrar casos dudosos.
- Sesgos potenciales derivados del etiquetado con un único anotador en LGPD y de la composición de los corpus de entrenamiento.
- No soporta tool calling, agentes ni multimodalidad; su uso está acotado a la tarea de clasificación descrita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-LoRA
- Variante ONNX int4 para navegador: https://huggingface.co/eduardoworrel/S5-nano-GDPR-LGPD-ONNX-genai-int4-S1S2
- Modelo base: https://huggingface.co/maritaca-ai/S5-nano
- Librería s1s2: https://github.com/eduardoworrel/s1s2
- Dataset GDPR-Transparency-200: https://github.com/tomcory/privacy-policy-annotator
- Corpus Claudinha (LGPD): https://zenodo.org/records/13371639
- Receta de pointer head y entrenamiento (Kev): https://github.com/jaredpalmer/kev
- Precursor alias3-web: https://huggingface.co/aliasrobotics/alias3-web
- Paper Browser Immune System: https://arxiv.org/abs/2611.15302
