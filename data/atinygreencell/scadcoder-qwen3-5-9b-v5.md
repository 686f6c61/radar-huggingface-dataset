# ATinyGreenCell/scadcoder-qwen3.5-9b-v5

## Resumen

scadcoder-qwen3.5-9b-v5 es un ajuste fino mediante LoRA del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario ATinyGreenCell y orientado a la generación y reparación de código OpenSCAD paramétrico para piezas de laboratorio de biología, en el contexto del proyecto Tiiny Pocket Lab. El modelo conserva el codificador de visión del modelo base (la arquitectura declarada es `Qwen3_5ForConditionalGeneration`, con pipeline `image-text-to-text`) y ha fusionado las capas de lenguaje ajustadas en safetensors en bf16. Cuenta con 9.653.104.368 parámetros (~9,65 mil millones) y un repositorio de 19,3 GB.

Su relevancia es muy concreta: no es un modelo de propósito general, sino una herramienta de dominio estrecho que convierte descripciones de piezas (y potencialmente imágenes) en scripts OpenSCAD renderizables y medibles, y que además sabe reparar scripts defectuosos a partir de un informe de medición. La versión v5 añade 1.500 conversaciones multi-turno de reparación con la misma forma que el benchmark interno del autor, lo que la hace especialmente útil para bucles agénticos de generar-renderizar-medir-corregir.

En el momento de redactar esta ficha el repositorio no tiene descargas ni likes, y la model card no publica resultados numéricos de benchmarks ni la longitud de contexto soportada. El autor indica explícitamente que debe ejecutarse con el modo de razonamiento (*thinking*) desactivado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal con codificador de visión (`Qwen3_5ForConditionalGeneration`); detalles de capas y atención no disponibles |
| Parámetros totales | 9.653.104.368 (~9,65 B, dato real de safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE, según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors en bf16 (sin GGUF, AWQ, GPTQ ni MLX) |
| Idiomas soportados | no disponible (los datos de entrenamiento descritos están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada), librería `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo multimodal de tipo *image-text-to-text*. Según la model card, el codificador de visión se preserva intacto y solo se ajustan las capas de lenguaje mediante LoRA, que posteriormente se fusionan en pesos bf16. El ajuste se realizó con rango LoRA 32 durante 3 épocas sobre 10.636 filas. No se especifican el número total de tokens, la composición completa del dataset, ni si hubo etapas de RLHF o DPO; sí se documenta el uso de generaciones rechazadas por muestreo (*rejection sampling*) y de ejemplos destilados de Claude Opus.

La innovación principal está en los datos y en el formato de las conversaciones, no en la arquitectura. La versión v5 amplía la v4 con 1.500 diálogos multi-turno de reparación construidos con la misma estructura que el benchmark del autor: descripción de la pieza, archivo OpenSCAD defectuoso (con un único parámetro de cabecera perturbado), informe de medición del benchmark sobre la pieza defectuosa y archivo correcto. El turno defectuoso se enmascara de la función de pérdida y se usa únicamente como contexto, de modo que el modelo aprende a corregir a partir de la evidencia de medición. Los datos de la v4 provienen de 7.238 ejemplos verificados por renderizado (v2), 269 generaciones obtenidas por *rejection sampling* (duplicadas) y 680 ejemplos destilados de Claude Opus sobre 17 familias de piezas ajenas a las tareas de Prompt-to-Bench (duplicados).

## Capacidades

- Generación de código OpenSCAD paramétrico para piezas de laboratorio, con parámetros en la cabecera del archivo que controlan dimensiones y geometría.
- Reparación multi-turno de scripts OpenSCAD defectuosos a partir de un informe de medición, corrigiendo un parámetro perturbado y devolviendo el archivo completo.
- Comprensión de imágenes gracias al codificador de visión heredado del modelo base (pipeline `image-text-to-text`), lo que permite partir de fotografías o diagramas de una pieza.
- Razonamiento sobre restricciones geométricas y de fabricación: cotas, tolerancias y encaje entre componentes dentro de una misma familia de piezas.
- Conversación multi-turno con historial de intentos previos, incluyendo contexto de archivos descartados.
- Capacidades generales de lenguaje y código heredadas de Qwen3.5-9B, aunque no se documenta su grado de conservación tras el ajuste.
- Modo *thinking* desactivado por recomendación explícita del autor; no se documenta soporte de *tool calling* ni de uso agéntico nativo.
- No se documentan capacidades de audio ni de generación de imágenes.

## Casos de uso

- **Generación de piezas paramétricas para prototipado de laboratorio**: el modelo traduce una descripción textual de un componente (por ejemplo, un soporte de tubo o una cubeta) a un archivo OpenSCAD con parámetros en la cabecera, listo para renderizar en el pipeline del proyecto Tiiny Pocket Lab. Es adecuado porque el ajuste se hizo sobre ejemplos verificados por renderizado.
- **Reparación automática guiada por metrología**: en un bucle de fabricación, se renderiza la pieza, se mide con el sistema del benchmark y se pasa el informe junto con el archivo defectuoso; el modelo devuelve la versión corregida. La v5 está entrenada exactamente con esta forma de conversación.
- **Reconstrucción de piezas a partir de fotografías**: usando el codificador de visión, el modelo puede recibir una imagen de una pieza existente y proponer un script OpenSCAD parametrizado que la reproduzca, útil para digitalizar utillaje de laboratorio.
- **Asistente integrado en el editor para diseño CAD textual**: un plugin que envuelva el modelo puede sugerir correcciones sobre el archivo abierto, explicar qué parámetro provoca un fallo de encaje y proponer el valor corregido, reduciendo el ciclo de prueba y error.
- **Generación de familias de variantes**: dado que los datos incluyen 17 familias de piezas, el modelo puede producir variantes de un mismo diseño (distintas alturas, diámetros o número de alojamientos) manteniendo coherencia geométrica entre ellas.
- **Verificación en CI de geometrías generadas**: integrado en un pipeline que ejecute OpenSCAD en modo consola, el modelo puede actuar como primer filtro que detecta y corrige errores sintácticos o paramétricos antes de llegar a la revisión humana.
- **Formación y documentación técnica**: el modelo puede generar ejemplos comentados de código OpenSCAD para tutoriales de diseño paramétrico, partiendo de las familias de piezas con las que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un benchmark propio del autor (Prompt-to-Bench) con informes de medición, pero no incluye cifras de precisión, ni comparaciones numéricas con otros modelos, ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM en bf16**: los pesos suman 19,3 GB; con caché KV y el codificador de visión hay que prever del orden de 22-26 GB para contexto moderado.
- **GPU profesionales**: cabe con holgura en A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB.
- **GPU de consumo**: una RTX 4090 o RTX 3090 de 24 GB queda al límite en bf16; una RTX 4080 de 16 GB no es suficiente sin cuantizar.
- **Cuantización**: no hay pesos cuantizados publicados. Si se generan, en 8 bits los pesos ocuparían unos 10-11 GB (RTX 4080/4090, 3090) y en 4 bits unos 6-7 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB), siempre con VRAM adicional para el codificador de visión y la caché KV.
- **Despliegue**: `transformers` es la vía nativa declarada. vLLM o TGI dependerían de que exista soporte para `Qwen3_5ForConditionalGeneration`, extremo no confirmado. llama.cpp u Ollama requerirían una conversión a GGUF que no está publicada, y el soporte de un modelo multimodal de esta arquitectura no está verificado.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v5 | ~9,65 B | no disponible | OpenSCAD paramétrico de laboratorio + reparación multi-turno | apache-2.0 | safetensors bf16 en HF |
| Qwen/Qwen3.5-9B (base) | ~9,65 B (según el ajuste) | no disponible | propósito general multimodal | apache-2.0 (según etiqueta del modelo derivado) | modelo público de referencia |
| scadcoder-qwen3.5-9b-v4 (versión anterior) | mismo modelo base | no disponible | OpenSCAD sin datos de reparación multi-turno | apache-2.0 | no disponible en la información proporcionada |

No se dispone de datos sobre otros ajustes finos comparables de OpenSCAD, ni de métricas que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Dominio muy restringido**: el ajuste se centra en piezas de laboratorio biológico y en el formato del benchmark del autor; es previsible un rendimiento pobre fuera de ese ámbito, incluyendo otros estilos de modelado CAD o código general.
- **Ausencia de validación externa**: cero descargas y cero likes en el momento de la ficha; no hay evidencia independiente de calidad ni de reproducibilidad.
- **Olvido catastrófico probable**: al ser un LoRA de rango 32 fusionado sobre las capas de lenguaje, las capacidades generales del modelo base pueden haberse degradado; no se documenta ninguna evaluación al respecto.
- **Modo de razonamiento obligatoriamente desactivado**: el autor indica ejecutar con *thinking* off; usar el modo de razonamiento puede producir salidas fuera de distribución.
- **Riesgo de alucinación de API**: como cualquier modelo de código, puede inventar funciones o módulos de OpenSCAD inexistentes; toda salida debe validarse con un renderizado real antes de su uso.
- **Idiomas no declarados**: la model card no especifica idiomas soportados y los datos descritos están en inglés, por lo que el comportamiento en castellano no está garantizado.
- **Sin cuantizaciones oficiales**: no hay GGUF ni formatos de baja precisión publicados, lo que limita el despliegue en hardware de consumo.
- **Procedencia de datos**: parte del entrenamiento usa ejemplos destilados de Claude Opus; conviene revisar los términos de uso aplicables a datos generados por terceros antes de un despliegue comercial, más allá de la licencia apache-2.0 del modelo.
- **Licencia**: apache-2.0 permite uso comercial, pero debe verificarse de forma independiente que el modelo base Qwen3.5-9B mantiene esa misma licencia.
- **Contexto desconocido**: al no publicarse la longitud de contexto, no se puede planificar el tamaño de las conversaciones multi-turno de reparación sin pruebas empíricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del benchmark y detalles de datos (sección 6.4): https://github.com/ATinyGreenCell/prompt-to-bench
