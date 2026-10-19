# Abiray/MiniCPM-V-4.7-1B-abliterated-heretic-GGUF

## Resumen

MiniCPM-V-4.7-1B-abliterated-heretic-GGUF es una redistribución cuantizada en formato GGUF del modelo multimodal openbmb/MiniCPM-V-4.7-1B, un MLLM (multimodal large language model) de aproximadamente 1.006 millones de parámetros (1B) desarrollado originalmente por OpenBMB para inferencia en dispositivo. La modificación introducida por el autor de este repositorio (Abiray) no afecta a la arquitectura ni a los pesos visuales, sino al alineamiento de seguridad: se han aplicado técnicas de *abliteration* mediante la herramienta Heretic v1.4.0 para neutralizar las direcciones de rechazo del modelo base.

El problema que resuelve esta variante es doble. Por un lado, empaqueta el modelo en GGUF con cinco niveles de cuantización (Q8_0 a Q3_K_M) más el proyector visual `mmproj-model-f16.gguf`, lo que permite ejecutarlo en CPU, GPUs de gama baja y dispositivos móviles mediante llama.cpp u Ollama. Por otro, elimina el sesgo de rechazo del modelo original, pasando de una tasa de rechazo de 99/100 a 9/100 según la model card, con una divergencia KL de 0.0191 respecto a la referencia, de modo que el modelo responde a instrucciones que el base declinaría.

Es relevante ahora porque combina tres factores poco habituales en un mismo artefacto: tamaño de 1B parámetros apto para *edge computing*, capacidades de visión (image-text-to-text) y un alineamiento deliberadamente laxo. Eso lo hace atractivo para investigación en seguridad, *red teaming*, generación creativa sin restricciones y despliegue offline, pero también lo convierte en un modelo inadecuado para productos de cara al público sin una capa de moderación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base MiniCPM-V de OpenBMB; el repositorio no documenta la arquitectura interna) |
| Parámetros totales | 1.006.209.856 (≈1B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M; proyector visual en f16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye `mmproj-model-f16.gguf` obligatorio para tareas visuales) |
| Modalidad | Image-text-to-text (visión + lenguaje) |
| Tamaño del repositorio | 5.0 GB |
| Modelo base | openbmb/MiniCPM-V-4.7-1B |
| Método de modificación | Abliteration con Heretic v1.4.0 |
| Descargas / likes | 7.726 / 13 |
| Fecha de creación | 2026-10-14 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El repositorio no publica detalles sobre la arquitectura interna del modelo base más allá de su naturaleza multimodal (pipeline `image-text-to-text`) y de la existencia de un proyector visual separado en precisión f16. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base usó RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla la ventana de contexto ni el diseño del codificador visual. Todo ello debería consultarse en la model card del modelo original de OpenBMB, que no forma parte de la información proporcionada.

La innovación técnica documentada en este repositorio es el proceso de *abliteration* aplicado con Heretic v1.4.0, que identifica y neutraliza las direcciones de rechazo en el espacio de activaciones. La model card reporta dos métricas de control: una reducción de la tasa de rechazo del 99% al 9% y una divergencia KL de 0.0191 frente al modelo de referencia, lo que sugiere —según el autor— que la coherencia lingüística y la comprensión visual se mantienen sin degradación apreciable. No se aportan evaluaciones independientes que verifiquen esa afirmación más allá de las dos métricas citadas.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Comprensión de imágenes: descripción de contenido visual, respuesta a preguntas sobre imágenes (VQA) y extracción de información de capturas o fotografías.
- Razonamiento multimodal: la model card menciona capacidades de *vision and reasoning* conservadas tras la abliteration, aunque no se cuantifican.
- Ejecución en dispositivo (*on-device*): diseñado explícitamente para despliegue en edge y móvil según el autor del modelo base.
- Respuesta a instrucciones sin rechazo previo: tasa de rechazo reportada de 9/100 frente a 99/100 del base.
- Compatibilidad con llama.cpp y Ollama, lo que habilita integración en aplicaciones locales y pipelines offline.
- Soporte de plantilla conversacional (`conversational`) y tag `endpoints_compatible`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo *thinking* explícito.

## Casos de uso

- **Asistente visual offline en dispositivo móvil**: con la cuantización Q4_K_M (672 MB) más el proyector visual (1.11 GB), el modelo cabe en un teléfono o tablet de gama alta y permite describir imágenes o leer documentos sin enviar datos a la nube, algo crítico en entornos con requisitos de privacidad.
- **Digitalización de documentos en campo**: técnicos que trabajan sin conectividad pueden fotografiar etiquetas, formularios o paneles y obtener extracción de texto o interpretación en inglés o chino, ejecutando llama.cpp sobre una CPU portátil.
- **Investigación en seguridad y *red teaming***: la reducción controlada de la tasa de rechazo con KL bajo lo convierte en una herramienta útil para estudiar comportamientos de modelos desalineados y para calibrar clasificadores de moderación frente a modelos que no se niegan a responder.
- **Generación creativa sin restricciones**: escritura de ficción, guiones o narrativa que aborde temáticas violentas o controvertidas, donde el modelo base declinaría la petición y este responde manteniendo coherencia (KL 0.0191).
- **Prototipado rápido de producto multimodal**: gracias a los cinco niveles de cuantización y a la licencia Apache 2.0, un equipo puede validar una idea de producto visión-lenguaje en local antes de invertir en un modelo mayor o en infraestructura GPU.
- **Sistemas de accesibilidad**: descripción automática de imágenes para personas con discapacidad visual en aplicaciones de escritorio, con latencia baja y sin dependencia de servicios externos.
- **Análisis de imágenes en robótica educativa o de bajo coste**: al requerir del orden de 2 GB de memoria para los cuantizados pequeños, puede embeberse en dispositivos tipo Raspberry Pi o mini-PC con GPU integrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. Las únicas métricas reportadas por el autor son las relativas al proceso de abliteration:

| Métrica | Modelo abliterado | Modelo base original |
|---|---|---|
| Tasa de rechazo | 9 / 100 | 99 / 100 |
| Divergencia KL | 0.0191 | 0.0000 (referencia) |

No se proporcionan datos de precisión en tareas de visión, razonamiento o generación de código, ni comparaciones con otros modelos en benchmarks públicos.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (pesos + proyector visual `mmproj-model-f16.gguf`):
  - Q8_0: ≈1.08 GB + 1.11 GB = ≈2.2 GB
  - Q6_K: ≈838 MB + 1.11 GB = ≈2.0 GB
  - Q5_K_M: ≈752 MB + 1.11 GB = ≈1.9 GB
  - Q4_K_M: ≈672 MB + 1.11 GB = ≈1.8 GB
  - Q3_K_M: ≈575 MB + 1.11 GB = ≈1.7 GB
  - Añadir caché KV y overhead del runtime: presupuestar entre 2,5 y 4 GB de memoria total según resolución de imagen y longitud de contexto.
- **GPU recomendadas**: cualquier GPU de consumo con 4 GB o más de VRAM es suficiente (RTX 3050, GTX 1650, RTX 4060, RTX 4090 sin aprovechamiento pleno). En el extremo profesional, A100 o H100 no aportan ventaja relevante para un modelo de 1B.
- **¿Cabe en GPU de consumo?** Sí, holgadamente, en todas las cuantizaciones. También funciona por CPU pura y en GPU integrada (Metal en Apple Silicon, Vulkan en iGPU).
- **Opciones de despliegue**: llama.cpp (`llama-mtmd-cli` o `llama-server` con `--mmproj`), Ollama, LM Studio, llama-cpp-python. El soporte de GGUF multimodal en vLLM y TGI no está confirmado en la información disponible y, en general, no es la vía recomendada para este formato.
- **Latencia y throughput**: no disponibles. Al no publicarse datos de tokens por segundo ni de tiempo de prefill, conviene medirlos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Alineamiento |
|---|---|---|---|---|---|
| Este modelo (MiniCPM-V-4.7-1B abliterated, GGUF) | ≈1B | No disponible | Apache 2.0 | Sí | Rechazo 9/100 |
| openbmb/MiniCPM-V-4.7-1B (base) | ≈1B | No disponible | Apache 2.0 | Sí | Rechazo 99/100 |
| SmolVLM2-2.2B-Instruct | ≈2,2B (no verificado en la información disponible) | No disponible | No disponible | Sí | Alineado |
| Qwen2.5-VL-3B-Instruct | ≈3B (no verificado en la información disponible) | No disponible | No disponible | Sí | Alineado |

Nota: los datos de los modelos alternativos no provienen de la información proporcionada en esta ficha, por lo que se marcan como no disponibles. La comparación principal y verificable es contra el modelo base, del que se conocen parámetros, licencia y tasas de rechazo. Frente a alternativas de 2B-3B, este modelo sacrifica capacidad bruta a cambio de un tamaño tres veces menor y de una huella de memoria de unos 2 GB, lo que lo sitúa en la franja de despliegue en móvil y CPU.

## Limitaciones y advertencias

- **Ausencia de alineamiento de seguridad**: la abliteration elimina deliberadamente el comportamiento de rechazo. El modelo puede producir contenido dañino, ilegal o sexualmente explícito sin filtros propios, por lo que no debe exponerse directamente a usuarios finales sin moderación externa.
- **Riesgo de degradación sutil**: aunque la KL reportada es baja (0.0191), cualquier modificación de pesos puede afectar a la coherencia en dominios específicos. El autor no aporta evaluaciones independientes que lo descarten.
- **Alucinación**: inherente a modelos de 1B parámetros, especialmente en tareas de OCR, conteo de objetos o lectura de texto pequeño en imágenes. No se publican métricas de fidelidad visual.
- **Cobertura lingüística limitada**: solo inglés y chino declarados. El rendimiento en castellano no está evaluado ni garantizado.
- **Contexto desconocido**: no se documenta la ventana de contexto, lo que impide planificar cargas de documentos largos con garantías.
- **Cuantización agresiva**: Q3_K_M (575 MB) conlleva pérdida de calidad notable en comparación con Q8_0; para tareas de razonamiento visual conviene usar Q6_K o Q8_0 siempre que la memoria lo permita.
- **Licencia**: el repositorio declara Apache 2.0 y el modelo base también, pero se trata de un derivado de terceros no auditado por OpenBMB. Conviene revisar los términos del modelo original antes de uso comercial.
- **Metadatos inconsistentes**: la fecha de creación indicada (2026-10-14) es posterior a la fecha actual, lo que sugiere un error de metadatos o una redistribución con fechas manipuladas; conviene verificarlo antes de confiar en la procedencia.
- **Documentación incompleta**: no se detallan arquitectura, dataset de entrenamiento, contexto ni benchmarks estándar. La ficha se apoya casi exclusivamente en la model card del autor del GGUF.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/MiniCPM-V-4.7-1B-abliterated-heretic-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Organización OpenBMB en HuggingFace: https://huggingface.co/openbmb

No se han encontrado en la búsqueda web enlaces relevantes al modelo, su paper, repositorio de código o demos; los resultados devueltos corresponden a foros sin relación con el tema y se han descartado.
