# MaJestyX/vlm-backdoor-opd-suite

## Resumen

`MaJestyX/vlm-backdoor-opd-suite` no es un modelo de lenguaje en sentido estricto, sino un repositorio que empaqueta un *benchmark* de evaluación de ataques de puerta trasera (*backdoor*) sobre modelos visión-lenguaje (VLM). El autor, identificado como MaJestyX, lo presenta como el material de soporte para un artículo académico dirigido a conferencias como CVPR, ICCV, NeurIPS o USENIX Security. El eje del estudio es el modelo base **Qwen2.5-VL-7B-Instruct**, sobre el que se comparan ocho líneas base de *backdoor* multimodal frente a un método propuesto denominado **ABCD-OPD** (destilación contrafactual).

El paquete no contiene pesos de modelo propios: el repositorio ocupa 0,1 GB y las instrucciones remiten a la descarga externa de Qwen2.5-VL-7B-Instruct desde ModelScope. Su función es orquestar la ejecución paralela de siete bloques experimentales sobre ocho GPU (A800 o A100 de 80 GB), evaluando los benchmarks POPE (sobre MS-COCO) y GQA. Por tanto, es relevante para investigadores en seguridad de modelos multimodales, no como modelo desplegable en producción.

La información pública es escasa: la *model card* está escrita en chino, no declara licencia, idiomas, pipeline ni tags de tarea, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: suite de evaluación de backdoor sobre Qwen2.5-VL-7B-Instruct (VLM transformer con encoder visual) |
| Parametros totales | No disponible (el modelo base referenciado, Qwen2.5-VL-7B-Instruct, tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información del repositorio |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la model card está en chino; el modelo base Qwen2.5-VL soporta múltiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el repo no incluye pesos; se descarga el modelo base vía ModelScope) |

## Arquitectura y entrenamiento

El objeto técnico del repositorio es un protocolo de ataque y defensa, no un entrenamiento reproducible de un modelo generativo. El modelo víctima es Qwen2.5-VL-7B-Instruct, un VLM con encoder visual y decoder de lenguaje. Sobre él se inyectan *backdoors* multimodales mediante parches visuales (tamaños 14×14 y 56×56 píxeles) con distintos niveles de transparencia, y se comparan ocho métodos de referencia: BadNets-I, Blended, SIG, ImgTrojan, VL-Trojan, BadVision, Dual-Key y BadNets-MM. El método propuesto, ABCD-OPD, se describe como destilación contrafactual con "señuelos" (decoy) y un profesor con ratio de escala α_T; el barrido incluye tasas de envenenamiento ρ de 0,5 %, 1,0 %, 3,0 % y 5,0 %.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La innovación declarada es metodológica: evaluación de especificidad frente a seis señuelos OOD desconocidos y pruebas de robustez frente a defensas como compresión JPEG y desenfoque gaussiano. La orquestación se realiza con un script `launch_8gpu_suite.sh` que distribuye siete módulos experimentales entre ocho GPU, con una duración estimada de 2,5 a 3 horas.

## Capacidades

- Ejecución de ataques de *backdoor* multimodal sobre Qwen2.5-VL-7B-Instruct con ocho líneas base comparables.
- Evaluación en benchmarks POPE (MS-COCO) y GQA con métricas de Clean Acc, ASR, Decoy FPR, PSNR, SSIM, OOD FPRs y Defense ASRs.
- Barrido de tasas de envenenamiento (0,5 %–5,0 %), tamaños de parche (14×14 y 56×56) y transparencia del parche.
- Ablación del componente decoy y del ratio de profesor α_T (mecanismo contrafactual).
- Auditoría de especificidad frente a seis señuelos OOD no vistos durante el entrenamiento.
- Pruebas de resistencia a defensas: compresión JPEG y desenfoque gaussiano.
- Salida de resultados en JSON por GPU (`results/suite_8gpu_results/*.json`) y logs individuales (`gpu_0.log` … `gpu_7.log`).
- No incluye tool calling, agentes, visión generativa ni *thinking mode*: es una suite de evaluación.

## Casos de uso

- **Investigación en seguridad de VLM**: reproducir la comparativa de ocho ataques de *backdoor* sobre Qwen2.5-VL-7B-Instruct para un artículo sometido a CVPR, ICCV, NeurIPS o USENIX Security, usando la matriz de ocho GPU documentada.
- **Auditoría de robustez previa al despliegue**: evaluar si un VLM propio es vulnerable a parches envenenados midiendo ASR y Decoy FPR sobre POPE y GQA antes de publicarlo.
- **Validación de defensas**: aplicar compresión JPEG y desenfoque gaussiano sobre las imágenes de entrada y medir la caída de ASR para decidir si esas transformaciones bastan como mitigación en un pipeline de inferencia.
- **Estudio de eficiencia de envenenamiento**: usar el barrido ρ ∈ {0,5 %, 1 %, 3 %, 5 %} para determinar el mínimo volumen de datos contaminados necesario para inducir el comportamiento objetivo, informando políticas de curaduría de datasets.
- **Análisis de especificidad OOD**: emplear los seis señuelos desconocidos para medir falsos positivos fuera de distribución, una métrica útil para comparar métodos de *backdoor* más allá del ASR clásico.
- **Reproducibilidad de resultados académicos**: el reparto fijo de módulos por GPU y la salida JSON estandarizada permiten a un colaborador reejecutar la suite y contrastar cifras con las del artículo.
- **Formación de investigadores**: como material docente para prácticas de seguridad multimodal con instrucciones paso a paso de entorno, descarga de pesos y monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* define las métricas que se calcularán (Clean Acc, ASR, Decoy FPR, PSNR, SSIM, OOD FPRs, Defense ASRs) y los benchmarks de evaluación (POPE sobre MS-COCO y GQA), pero no incluye tablas de resultados numéricos.

## Requisitos de hardware

- **GPU**: el autor recomienda una máquina con 8 GPU A800 o A100 de 80 GB; la suite distribuye siete módulos experimentales entre ocho tarjetas.
- **VRAM estimada**: no disponible de forma explícita; el modelo base es de 7B parámetros y el ataque se aplica sobre pesos completos, lo que exige tarjetas de clase servidor.
- **GPU de consumo**: no se documenta soporte para RTX 4090 ni tarjetas menores; el reparto de 8 GPU paralelas sugiere que no está pensado para hardware de consumo.
- **Almacenamiento**: repositorio de 0,1 GB; hay que sumar la descarga externa de Qwen2.5-VL-7B-Instruct vía ModelScope.
- **Software**: entorno PyTorch 2.x con `requirements.txt` propio; orquestación mediante `bash launch_8gpu_suite.sh <ruta_modelo>`.
- **Tiempo de ejecución**: 2,5 a 3 horas para la suite completa en 8 GPU independientes.
- **Opciones de despliegue**: no se documentan vLLM, llama.cpp, Ollama ni TGI; la suite es un conjunto de scripts de evaluación, no un servidor de inferencia.

## Comparativa con modelos similares

| Repositorio / suite | Modelo víctima | Nº de ataques comparados | Benchmarks | Licencia | Pesos incluidos |
|---|---|---|---|---|---|
| MaJestyX/vlm-backdoor-opd-suite | Qwen2.5-VL-7B-Instruct | 8 líneas base + ABCD-OPD | POPE (MS-COCO), GQA | No disponible | No (descarga externa) |
| Alternativas de evaluación de backdoor multimodal | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre suites comparables en la documentación proporcionada, por lo que la comparativa con alternativas de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- La *model card* está redactada íntegramente en chino y no declara licencia, idiomas, pipeline ni tags de tarea; el uso comercial queda sin definir y requiere contactar con el autor.
- El repositorio no incluye pesos ni datos de entrenamiento: la reproducibilidad depende de descargar Qwen2.5-VL-7B-Instruct desde ModelScope y de disponer de las rutas exactas indicadas.
- Las instrucciones asumen rutas absolutas concretas (`/VPD/vision_opd_attack_defense/models/...`) y un clúster de 8 GPU A800/A100; no hay soporte documentado para configuraciones menores.
- No se publican resultados numéricos ni tablas de benchmarks en la información disponible, por lo que no es posible verificar las afirmaciones del artículo.
- Es material de investigación en seguridad ofensiva: la inyección de *backdoors* en modelos desplegados puede vulnerar términos de servicio y legislación aplicable; debe usarse en entornos controlados y con autorización.
- El repositorio no registra descargas ni interacciones, lo que limita la validación comunitaria del código.
- Riesgo de alucinación y sesgos del modelo base: no evaluados ni documentados en esta suite.
- No se especifican limitaciones de contexto ni de idioma del modelo víctima dentro de este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/MaJestyX/vlm-backdoor-opd-suite
- Modelo base referenciado (Qwen2.5-VL-7B-Instruct, descarga vía ModelScope): https://modelscope.cn/models/qwen/Qwen2.5-VL-7B-Instruct
- No se han encontrado en la información disponible enlaces a paper, blog, repositorio de código o demo adicionales.
