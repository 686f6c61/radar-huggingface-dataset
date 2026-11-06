# manateelazycat/YOLOv4-Tiny-Jetson

## Resumen

YOLOv4-Tiny-Jetson es un repositorio de artefactos de modelo publicado por el usuario manateelazycat en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un paquete de activos que incluye los ficheros originales de Darknet (cfg y pesos) de YOLOv4-tiny, las etiquetas COCO en el formato que emplea Frigate y un plan de TensorRT 8.6.2 compilado específicamente para la GPU AGX Orin (arquitectura SM87) en JetPack 6. El objetivo es facilitar la reproducibilidad del detector en despliegues sobre hardware NVIDIA Jetson.

El modelo resuelve el problema de empaquetar y versionar de forma determinista un detector de objetos ligero para sistemas embebidos con aceleración TensorRT. El contrato de inferencia está fijado: entrada uint8 RGB en formato NCHW con forma [1, 3, 416, 416] y salida cruda de detección de 20x6, compatible con el detector legacy de Frigate. La relevancia actual radica en la creciente demanda de detección de objetos en el borde (edge) con requisitos estrictos de trazabilidad y verificación de integridad.

Arquitecturalmente se trata de YOLOv4-tiny, una variante compacta de la familia YOLOv4 basada en una red troncal CSPDarknet-tiny con dos cabezas de detección. El repositorio ocupa 0,1 GB y no incluye imágenes de ejecución ni grabaciones de cámara. La licencia se declara como "other" con el nombre "upstream-mixed-notices", remitiendo a los términos originales de Darknet.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv4-tiny (CSPDarknet-tiny, dos cabezas de detección) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 416x416) |
| Tipos de cuantización | no disponible (plan TensorRT precompilado; precisión no especificada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other / upstream-mixed-notices (ver enlace a licencia de Darknet) |
| Formato de pesos | Darknet cfg/weights originales, plan TensorRT 8.6.2, ONNX (según tags) |

## Arquitectura y entrenamiento

El modelo subyacente es YOLOv4-tiny, un detector de objetos de una etapa con arquitectura CSPDarknet-tiny. Emplea dos cabezas de detección a distintas escalas para capturar objetos de diferentes tamaños, y está diseñado para ofrecer un equilibrio entre velocidad y precisión en hardware limitado. El repositorio no documenta el proceso de entrenamiento: se limita a empaquetar los pesos y la configuración originales de Darknet junto con las etiquetas COCO adaptadas al formato de Frigate.

La innovación técnica principal del repositorio no está en el modelo en sí, sino en el pipeline de compilación y verificación. Se incluye un plan de TensorRT compilado en una imagen de referencia fijada y comparado contra el detector legacy de Frigate con el mismo tensor y plan; según la model card, los 20x6 valores coincidieron en un tensor cero y en un tensor de una imagen pública de persona. El repositorio proporciona ficheros de procedencia (plan-provenance.json, fingerprint-spec.json, upstream-sources.json) para garantizar la trazabilidad y la verificación de integridad mediante tamaños y SHA256.

## Capacidades

- Detección de objetos en imágenes con entrada uint8 RGB NCHW [1, 3, 416, 416].
- Salida de detección cruda con formato fijado de 20x6, compatible con el detector legacy de Frigate.
- Etiquetas COCO en el formato de Frigate para las clases detectadas.
- Aceleración mediante TensorRT 8.6.2 en GPU AGX Orin (SM87).
- Verificación de integridad y procedencia del plan compilado mediante ficheros de huellas y SHA256.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión multimodal, tool calling, agentes ni multilingüismo.

## Casos de uso

- Vigilancia con Frigate en NVIDIA Jetson: el plan TensorRT permite ejecutar el detector YOLOv4-tiny en una AGX Orin con el mismo contrato de salida que el detector legacy, facilitando la migración sin cambios en la lógica de post-proceso.
- Detección de personas en sistemas de videovigilancia doméstica: las etiquetas COCO y la salida 20x6 permiten integrar el modelo en pipelines de Frigate para alertas de presencia.
- Despliegue en el borde con requisitos de reproducibilidad: los ficheros de procedencia y las huellas SHA256 permiten bloquear revisiones inmutables y verificar los artefactos antes de cargarlos en producción.
- Prototipado de detección de objetos en hardware Jetson: al incluir los pesos originales de Darknet y el plan TensorRT, sirve como base para comparar el rendimiento nativo frente a otras implementaciones.
- Validación de pipelines de compilación TensorRT: el repositorio documenta el proceso de compilación en build/orin-jp6/ y los orígenes del conversor, útil para reproducir el flujo en otros perfiles de hardware.
- Integración en controladores de modelo con verificación de integridad: los controladores de runtime pueden exigir la comprobación de tamaños y SHA256 antes de cargar el plan, tal como indica la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una comparación de equivalencia numérica (coincidencia de los 20x6 valores) entre el plan compilado y el detector legacy de Frigate en dos tensores de prueba, sin métricas de precisión (mAP), latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el plan está compilado para AGX Orin (SM87), cuya memoria es unificada.
- GPU recomendada: NVIDIA Jetson AGX Orin con JetPack 6 y TensorRT 8.6.2.
- Compatibilidad con GPU de consumo: no disponible; el plan está fijado a un perfil concreto y la model card advierte explícitamente de que no debe usarse en un perfil diferente.
- Opciones de despliegue: TensorRT 8.6.2 con el plan incluido; los pesos originales de Darknet permiten otras vías de conversión, pero no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv4-Tiny-Jetson | no disponible | 416x416 | no disponible | other / upstream-mixed-notices | Hugging Face (11 descargas) |
| YOLOv4-tiny (original, Darknet) | no disponible en la información | 416x416 | no disponible | ver licencia de Darknet | Repositorio Darknet |
| YOLOv5n / YOLOv8n | no disponible en la información | variable | no disponible | no disponible en la información | no disponible en la información |

No se dispone de datos de rendimiento comparables en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El plan TensorRT está compilado para un perfil concreto (AGX Orin SM87, TensorRT 8.6.2, JP6); la model card advierte de que nunca debe usarse en un perfil diferente.
- La evidencia de la model card es "native candidate evidence", no una validación final de precisión, HTTP enrolado, cuatro cámaras durante 24 horas, JP7 ni Thor.
- El repositorio no contiene imagen de runtime ni grabaciones de cámara; solo activos de modelo e inputs de reproducibilidad.
- La licencia es "other" con nombre "upstream-mixed-notices" y remite a los términos originales de Darknet; es responsabilidad del usuario revisar las condiciones para uso comercial.
- No se documentan sesgos del modelo ni riesgos de alucinación (no es un modelo generativo), pero al ser un detector entrenado sobre COCO hereda las limitaciones de clases y distribución de dicho dataset.
- El repositorio tiene un volumen muy bajo de descargas (11) y ningún "like", lo que limita la evidencia comunitaria de uso en producción.
- Los controladores de runtime deben bloquear revisiones inmutables y verificar tamaños y SHA256 antes de cargar el plan, según indica la model card.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/manateelazycat/YOLOv4-Tiny-Jetson
- Repositorio de runtime: https://huggingface.co/manateelazycat/YOLOv4-Tiny-Jetson-Runtime
- Licencia de Darknet referenciada: https://github.com/AlexeyAB/darknet/blob/a298f94255a20a3198d80ea512755d9e5dddbf02/LICENSE
