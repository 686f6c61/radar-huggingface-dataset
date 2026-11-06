# kinasr/visual-verdict-2b

## Resumen

Visual Verdict 2B es un modelo vision-lenguaje especializado en la detección y clasificación de regresiones visuales en interfaces web. Lo desarrolla el usuario kinasr y se construye como un fine-tuning de LiquidAI/d1-2B, que a su vez se apoya en la arquitectura tri-híbrida LFM3-VL-2B de Liquid AI. El modelo resuelve un problema muy concreto de los pipelines de CI/CD: distinguir un cambio visual benigno (un contador, una fecha dinámica) de una regresión real (un layout roto, un botón desaparecido, un asset que no carga) sin generar texto autoregresivo.

Su rasgo diferencial es que emite decisiones tipadas en un único forward pass, con probabilidades calibradas por temperatura, en lugar de producir JSON o explicaciones en lenguaje natural. Esto elimina los errores de formato y la latencia asociada a la decodificación token a token, algo crítico cuando el modelo debe ejecutarse en cada build. Con 2.180.325.888 parámetros y un repositorio de 4,4 GB, se posiciona en la franja de modelos pequeños desplegables en hardware modesto.

La relevancia actual viene de su enfoque «System 1»: clasificación de 6 clases semánticas (Pass, Layout, Missing, Styling, Asset y Unknown) a partir de un par de capturas —referencia y render actual— más telemetría del DOM. El modelo incorpora una compuerta explícita de revisión humana para casos ambiguos, lo que encaja con flujos de QA automatizados donde el coste de un falso positivo es alto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-VL-2B tri-híbrida (base LiquidAI/d1-2B), vision-lenguaje |
| Parametros totales | 2.180.325.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor reporta inferencia en float16 sobre MPS) |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-1.0 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura tri-híbrida LFM3-VL-2B de Liquid AI, que combina capas de atención con otros mecanismos de secuencia en un transformer híbrido orientado a eficiencia. Sobre esa base, kinasr aplica un fine-tuning específico para triaje visual de UI: el modelo recibe como entrada un par de imágenes (captura de referencia y captura actual) junto con telemetría estructurada del navegador (`app_state`) y produce logits sobre seis clases canónicas. La entrada se gestiona mediante un componente denominado `SlotReader`, que estructura las opciones y evita la generación de texto libre.

El post-entrenamiento incluye un ajuste de calibración de temperatura con LBFGS sobre logits de validación retenidos, cuyos parámetros se publican en `calibration.json`. El autor reporta que el modelo se entrenó sobre una distribución de datos distinta (v3) a la del benchmark histórico `dataset-v2`, lo que explica el comportamiento asimétrico entre ambos conjuntos de evaluación. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de regresiones visuales web en 6 clases semánticas: Pass, Layout, Missing, Styling, Asset y Unknown.
- Detección de cambios dinámicos benignos (timestamps, contadores, texto variable) que no deben marcarse como regresión.
- Identificación de roturas de layout: fallos de Flex/Grid, solapamientos de componentes y desplazamientos de flujo no intencionados.
- Detección de elementos interactivos o CTA desaparecidos (botones, inputs, slots de navegación inertes).
- Reconocimiento de CSS roto o contraste ilegible, incluyendo variantes de tema claro y oscuro.
- Detección de assets multimedia no cargados: imágenes, iconos, SVG y miniaturas.
- Emisión de probabilidades calibradas por temperatura para umbralizar automáticamente en CI/CD.
- Compuerta explícita de Unknown para casos ambiguos: banners de consentimiento, overlays de carga, capturas incompletas y desajustes de ruta.
- Inferencia en un único forward pass sin generación autoregresiva de tokens.
- Procesamiento conjunto de imágenes y telemetría estructurada del DOM.

## Casos de uso

- Integración en pipelines de CI/CD para QA visual: el modelo evalúa cada build comparando la captura de referencia con el render actual y devuelve una clase con confianza; los veredictos por encima de 0,90 pueden autoaprobarse o autobloquearse sin intervención humana.
- Triaje automático de fallos en suites de Playwright o Cypress: en lugar de un pixel-diff ciego, el modelo indica si el fallo es de layout, de styling o de asset, lo que acelera la asignación del ticket al equipo correcto.
- Reducción de falsos positivos en tests visuales: los cambios benignos por datos dinámicos se clasifican como Pass, evitando que los equipos desactiven las comprobaciones visuales por ruido.
- Monitorización de regresiones en producción: ejecución periódica sobre rutas críticas para detectar roturas de CSS o assets caídos antes de que las reporte el usuario.
- Auditoría de accesibilidad visual: detección de contrastes ilegibles y tipografías rotas en temas claros y oscuros como paso previo a una revisión manual.
- Enrutado a revisión humana: la clase Unknown y las confianzas bajas permiten derivar automáticamente los casos ambiguos (banners de consentimiento, capturas incompletas) a un QA engineer, con el coste asociado acotado.
- Validación de despliegues multi-tenant: comparación de renders entre entornos o clientes para verificar que una plantilla compartida no rompe variantes específicas.

## Benchmarks y rendimiento

Evaluación del autor bajo ajustes coincidentes (cap de imagen a 640 px, 4 rotaciones cíclicas de opciones, MPS float16, calibración nativa de `SlotReader`, sin cortocircuito por píxeles).

| Modelo | OOD v3 (360 pares) | Histórico v2 (300 pares) | Binario Pass/Defecto (OOD v3) | Binario Pass/Defecto (v2) | Latencia media OOD (s) | Latencia media v2 (s) |
|---|---|---|---|---|---|---|
| kinasr/visual-verdict-2b | 76,9% (277/360) | 58,7% (176/300) | 91,9% | 97,0% | 3,143 | 2,888 |
| kinasr/imajev-2b-web-visual-testing | 61,4% | 76,3% | 89,7% | 97,0% | 4,973 | 7,496 |
| LiquidAI/d1-2B (zero-shot) | 35,6% | 43,0% | 58,3% | no disponible | 3,081 | 3,305 |
| LiquidAI/LFM3-VL-2B (zero-shot) | 16,9% | 18,0% | 19,4% | no disponible | 3,460 | 3,137 |
| pixel-diff (baseline tradicional) | 25,0% | 33,3% | no disponible | no disponible | 0,023 | 0,020 |

Recall por clase de `kinasr/visual-verdict-2b`:

| Clase canónica | Recall OOD v3 (60/clase) | Recall v2 histórico (50/clase) |
|---|---|---|
| Pass | 60,0% | 100,0% |
| Layout | 90,0% | 60,0% |
| Missing | 81,7% | 68,0% |
| Styling | 70,0% | 24,0% |
| Asset | 100,0% | 64,0% |
| Unknown | 60,0% | 36,0% |

Calibración: con confianza ≥ 0,90 sobre OOD v3, el modelo cubre el 77,8% del benchmark con una precisión empírica del 84,3% (ECE = 0,1556, Brier = 0,3797). La latencia reportada incluye las 4 rotaciones y el preprocesado de imagen, excluyendo la carga del modelo (unos 0,75 s por forward pass).

## Requisitos de hardware

- VRAM estimada para inferencia en float16: en torno a 4,4 GB solo para pesos, más el overhead de activaciones y del codificador visual; el autor reporta ejecución en Apple Silicon con MPS en float16.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para float16 con margen; A100 y H100 son sobredimensionadas para este tamaño, pero válidas para lotes grandes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en tarjetas de 8 GB conviene vigilar el pico de memoria del codificador visual.
- Opciones de despliegue: transformers con `custom_code` (el modelo requiere cargar código propio del repositorio); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia: aproximadamente 3,1 s por evaluación completa de 4 rotaciones en MPS float16, y unos 0,75 s por forward pass individual sin contar la carga del modelo. No se dispone de cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión OOD v3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinasr/visual-verdict-2b | 2,18 B | no disponible | 76,9% (6 clases) / 91,9% (binario) | lfm-open-license-1.0 | Hugging Face, transformers |
| kinasr/imajev-2b-web-visual-testing | no disponible (base 2B) | no disponible | 61,4% (6 clases) / 89,7% (binario) | no disponible | Hugging Face |
| LiquidAI/d1-2B | 2 B (aprox.) | no disponible | 35,6% (6 clases) / 58,3% (binario) | lfm-open-license-1.0 | Hugging Face, transformers |
| LiquidAI/LFM3-VL-2B | 2 B (aprox.) | no disponible | 16,9% (6 clases) / 19,4% (binario) | lfm-open-license-1.0 | Hugging Face, transformers |

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy estrecho (triaje visual de UI web); no es un VLM de propósito general y su rendimiento fuera de esa tarea no está caracterizado.
- El recall en la clase Styling sobre el conjunto histórico v2 es solo del 24,0%, lo que sugiere fragilidad ante distribuciones de datos distintas a la de entrenamiento.
- El recall en Pass sobre OOD v3 es del 60,0%, con riesgo de falsos positivos en cambios benignos no vistos durante el entrenamiento.
- La clase Unknown tiene un recall del 60,0% en OOD v3 y del 36,0% en v2: los casos ambiguos pueden clasificarse erróneamente como defectos o pases.
- La calibración presenta un ECE de 0,1556, lo que implica desviaciones no triviales entre confianza declarada y precisión empírica; los umbrales de autoaprobación deben validarse sobre el dominio propio.
- El modelo requiere `trust_remote_code` en transformers por el uso de `custom_code`; conviene auditar el código antes de desplegarlo en producción.
- La licencia lfm-open-license-1.0 no es una licencia open source estándar; deben revisarse sus términos en el enlace oficial antes de un uso comercial.
- No se documentan idiomas soportados ni comportamiento multilingüe.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados, lo que limita la planificación de despliegues con cuantización agresiva.
- El modelo se entrenó sobre una distribución v3 distinta de la del benchmark v2; las comparaciones con `imajev-2b-web-visual-testing` en v2 favorecen a este último por estar en distribución.
- Solo 55 descargas y 1 like en el momento de la consulta: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinasr/visual-verdict-2b
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Licencia LFM Open License 1.0: https://www.liquid.ai/lfm-license
- Modelo comparable del mismo autor: https://huggingface.co/kinasr/imajev-2b-web-visual-testing
- Ficha en Free2AITools: https://free2aitools.com/model/kinasr/visual-verdict-2b
