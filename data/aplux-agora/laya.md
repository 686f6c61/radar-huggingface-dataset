# APLUX-Agora/laya

## Resumen

Laya es un modelo de clasificación de texto publicado por APLUX-Agora dentro de su plataforma Agora, orientada al despliegue de modelos en hardware Qualcomm para escenarios AIoT. El repositorio no contiene los pesos originales en formato estándar, sino recursos convertidos y empaquetados por la herramienta Model Farm para su ejecución sobre el Qualcomm Neural Network (QNN) SDK en placas concretas. La model card indica que el modelo recibe texto en inglés y una lista de categorías candidatas, ejecuta un encoder ModernBERT junto con una cabeza de clasificación y una cabeza de decisión calibrada, y devuelve la etiqueta asignada junto con el vector completo de probabilidades.

El artefacto está pensado para inferencia en el borde: la única placa medida y publicada es la Rhino Pi X1 con SoC QCS8550, donde la inferencia en FP16 tarda 106,2 ms según las mediciones de Agora. El tamaño del repositorio es de 0,9 GB y no se documentan parámetros totales, longitud de contexto ni composición del dataset de entrenamiento. La licencia es propia (APLUX Model Farm License), distinta de la del modelo fuente original, cuyos términos no se detallan en la información disponible.

La relevancia de este modelo es acotada pero específica: ejemplifica el patrón de distribución de clasificadores de texto compactos convertidos a binarios QNN para placas Qualcomm, con un pipeline de preprocesado, ejecución y postprocesado exportable desde la plataforma Agora. Para un desarrollador que evalúe modelos de clasificación en AIoT, laya es un caso de despliegue medido y reproducible más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT con cabeza de clasificación y cabeza de decisión calibrada (según model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (precisión por defecto medida); otras precisiones no detalladas |
| Idiomas soportados | inglés (entrada de texto en inglés según model card) |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente no especificada |
| Formato de pesos | Binarios QNN (`model.bin`) empaquetados por SoC en `targets/<SoC>/`, con `model.json` de configuración; no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe un pipeline de clasificación compuesto por un encoder ModernBERT, una cabeza de clasificación y una cabeza de decisión calibrada que produce la etiqueta final junto con el vector completo de probabilidades. ModernBERT es una familia de encoders transformer con atención de soporte para secuencias largas y kernels optimizados, aunque la información proporcionada no confirma la variante concreta ni el número de capas, dimensión oculta o parámetros totales. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre número de tokens, composición del corpus, tareas de preentrenamiento, ajuste fino supervisado ni técnicas de alineación como RLHF o DPO.

La innovación técnica destacable no está en el modelo en sí, sino en el pipeline de despliegue: APLUX Model Farm convierte el modelo fuente en recursos ejecutables sobre QNN para SoCs Qualcomm, con un `model.json` que declara la precisión por defecto y las rutas de cada variante, binarios `model.bin` por precisión y paquetes multifichero tal como los publica la herramienta. El repositorio incluye además `NOTICE.md` y `SHA256SUMS` para verificar procedencia e integridad. No se detalla si la cabeza de calibración se entrena de forma conjunta con el encoder o se ajusta a posteriori.

## Capacidades

- Clasificación de texto: recibe un texto en inglés y una lista de categorías candidatas y devuelve la categoría asignada.
- Salida probabilística completa: además de la etiqueta, emite un objeto JSON con las probabilidades de todas las clases, lo que permite umbrales y abstención.
- Decisión calibrada: la cabeza de decisión calibrada sugiere un ajuste de confianza orientado a umbrales operativos, aunque no se documenta el método de calibración.
- Ejecución en el borde sobre Qualcomm: recursos QNN listos para placas con SoC QCS8550.
- Despliegue reproducible: pipeline de preprocesado, runner y postprocesado exportables desde Agora.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, código, matemáticas, visión, audio, tool calling ni soporte multilingüe más allá del inglés.

## Casos de uso

- Clasificación de tickets de soporte en inglés: el modelo asigna cada mensaje entrante a una categoría predefinida (facturación, incidencia técnica, cancelación) y devuelve probabilidades para enrutar con umbral de confianza; encaja en placas QCS8550 por su latencia de 106,2 ms en FP16.
- Moderación de contenido en dispositivos de borde: clasificación de textos cortos en inglés en pasarelas AIoT antes de enviarlos a la nube, reduciendo ancho de banda y preservando privacidad.
- Etiquetado de reseñas y encuestas: categorización automática de feedback de producto en inglés con salida probabilística para priorizar revisiones humanas en los casos de baja confianza.
- Enrutamiento de intenciones en asistentes de voz locales: clasificación de transcripciones en inglés en un dispositivo con SoC Qualcomm para decidir la acción siguiente sin llamada a servidor.
- Filtrado previo en pipelines de datos: clasificación de grandes lotes de documentos en inglés para separar categorías antes de un procesado más costoso, usando el runner exportado desde Agora.
- Clasificación en cámaras y pasarelas industriales: integración del binario QNN en flujos AIoT donde el texto proviene de OCR local y debe clasificarse en la misma placa, con la latencia medida como referencia de diseño.
- Prototipado y validación de despliegue: uso del proyecto exportado desde Agora para comparar la latencia real en QCS8550 frente a la inferencia en servidor antes de comprometerse con el hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato de rendimiento medido es la latencia de inferencia en la placa Rhino Pi X1 (SoC QCS8550) en FP16: 106,2 ms, según las mediciones de Agora.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está empaquetado para ejecución en NPU/SoC Qualcomm, no para GPU convencional.
- GPU recomendadas: no aplica según la información disponible; el destino documentado es el SoC QCS8550 (placa Rhino Pi X1).
- Cabe en GPU de consumo: no disponible; no se publican pesos en formatos ejecutables en GPU (safetensors, GGUF).
- Opciones de despliegue: QNN SDK con los binarios `model.bin` y `model.json` de `targets/QCS8550/`; el runner y el proyecto exportado se obtienen desde Agora (opción «部署指南» o exportación de un workflow).
- Latencia y throughput estimados: 106,2 ms por inferencia en QCS8550 en FP16 (medido por Agora); throughput no disponible.
- Descarga: `hf download APLUX-Agora/laya --include "targets/$AGORA_SOC/*" --local-dir "$AGORA_WORKSPACE/resources"`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| Laya (APLUX-Agora) | ModernBERT + cabezas de clasificación y calibración | no disponible | no disponible | APLUX Model Farm License | Binarios QNN para QCS8550 |
| ModernBERT (modelo fuente probable) | Encoder transformer | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | safetensors (no confirmado) |
| Otros clasificadores de texto en Agora | no disponible | no disponible | no disponible | APLUX Model Farm License | Binarios QNN |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas: la entrada documentada es texto en inglés; no se declara soporte de castellano ni de otros idiomas.
- Contexto: no se publica la longitud máxima de secuencia; textos largos pueden truncarse sin aviso documentado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad.
- Alucinación: al ser un clasificador, el riesgo se traslada a etiquetas erróneas con alta confianza; la calibración de la cabeza de decisión no está descrita.
- Licencia: la licencia APLUX Model Farm License cubre los recursos convertidos, no el modelo fuente; los términos del modelo original no se especifican y deben revisarse antes de uso comercial.
- Hardware: los binarios están atados al SoC QCS8550; no hay artefactos para GPU, CPU genérica ni otros SoC en la información disponible.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin histórico de uso ni comunidad.
- Producción: la latencia de 106,2 ms corresponde a una única placa y precisión; no hay datos de throughput, consumo ni estabilidad en carga sostenida.
- Trazabilidad: conviene verificar `NOTICE.md` y `SHA256SUMS` antes de desplegar los binarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/laya
- Demostración online en Agora: https://mega.aidlux.com/models/laya
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/laya/blob/main/LICENSE_MODEL_FARM.pdf
