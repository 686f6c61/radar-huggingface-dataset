# Acapellas/uvr5-models

## Resumen

`Acapellas/uvr5-models` no es un modelo de lenguaje, sino un repositorio espejo de modelos preentrenados de separación de fuentes musicales (stem separation) en formato ONNX. Concretamente, redistribuye cinco modelos de la familia KUIELab-MDX-Net empleados por el proyecto Ultimate Vocal Remover (UVR) y una exportación ONNX de Hybrid Transformer Demucs (HTDemucs) de Meta AI. El repositorio lo mantiene el usuario Acapellas como copia de seguridad y espejo de descarga estable, sin afiliación con los autores originales, ante la dependencia de los archivos publicados en las releases de GitHub de `TRvlvr/model_repo`.

El interés práctico reside en que agrupa en un único repositorio de 0,4 GB los pesos necesarios para separar voces de instrumentales y para dividir una mezcla en cuatro pistas (voz, batería, bajo y resto). Los modelos MDX-Net ocupan entre 28 y 64 MB cada uno, mientras que la exportación de HTDemucs pesa 172 MB. Todos se distribuyen bajo licencia MIT, lo que permite uso comercial y redistribución conservando la atribución.

No se trata de un modelo generativo ni conversacional: no procesa texto, no tiene ventana de contexto lingüístico ni parámetros en el sentido habitual de un LLM. Su unidad de trabajo es el audio: recibe una señal mezclada y devuelve las pistas separadas. Es relevante para desarrolladores que necesitan integrar separación de voces en aplicaciones de karaoke, remezcla, transcripción o producción musical sin depender de la disponibilidad de las releases originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net (KUIELab-MDX-Net, red de dos flujos) y HTDemucs (transformer híbrido) |
| Parametros totales | no disponible (el repositorio no publica recuento de parámetros; solo tamaños de archivo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen ya en ONNX, sin variantes cuantizadas publicadas) |
| Idiomas soportados | en (etiqueta del repositorio; el modelo opera sobre audio, no sobre texto) |
| Licencia | MIT |
| Formato de pesos | ONNX |

Detalle de los archivos incluidos:

| Archivo | Tamano | Funcion |
|---|---|---|
| `UVR-MDX-NET-Inst_HQ_3.onnx` | 64 MB | Separación instrumental/vocal de alta calidad |
| `UVR_MDXNET_Main.onnx` | 64 MB | Modelo principal de separación vocal MDX-Net |
| `UVR_MDXNET_KARA_2.onnx` | 50 MB | Separación de stems para karaoke (v2) |
| `UVR_MDXNET_KARA.onnx` | 28 MB | Separación de stems para karaoke |
| `UVR_MDXNET_3_9662.onnx` | 28 MB | MDX-Net v3 (96,62 SDR) |
| `htdemucs_embedded.onnx` | 172 MB | HTDemucs, separación en 4 stems (vocals, drums, bass, other) |

## Arquitectura y entrenamiento

Los modelos UVR pertenecen a KUIELab-MDX-Net, una red neuronal de dos flujos presentada en el artículo *KUIELab-MDX-Net: A Two-Stream Neural Network for Music Demixing* (arXiv:2111.12203) por Choi, Kim, Chung, Lee y Jung. La arquitectura combina un flujo temporal y un flujo espectral para estimar las máscaras de separación de cada fuente; los pesos aquí incluidos son exportaciones ONNX de los modelos entrenados y publicados por el proyecto UVR. El repositorio no documenta el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de refinamiento posteriores.

La exportación `htdemucs_embedded.onnx` corresponde a Hybrid Transformer Demucs, descrito en *Hybrid Transformers for Music Source Separation* (arXiv:2211.00847) por Défossez, Usunier, Bottou y Bach (Meta AI). HTDemucs combina un codificador/decodificador convolucional con capas de atención transformer sobre representaciones tiempo-frecuencia, y separa la mezcla en cuatro stems. La conversión a ONNX la realiza el proyecto `timcsy/demucs-web-onnx`, orientado a inferencia en navegador. No se dispone de información sobre hiperparámetros, número de épocas ni estrategia de aumento de datos en la documentación proporcionada.

## Capacidades

- Separación de voz e instrumental a partir de una mezcla musical estéreo.
- Generación de pistas de karaoke (eliminación de la voz principal) con los modelos `KARA` y `KARA_2`.
- Separación en cuatro stems (vocals, drums, bass, other) mediante HTDemucs.
- Inferencia multiplataforma gracias al formato ONNX (CPU, GPU y entornos web con ONNX Runtime / WebGPU).
- Procesamiento por lotes de varios archivos de audio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión ni audio generativo: es exclusivamente un modelo de demixing.

## Casos de uso

- **Generación de pistas de karaoke**: usar `UVR_MDXNET_KARA_2.onnx` sobre una canción estéreo para obtener la instrumental sin voz principal, adecuado para aplicaciones de karaoke o playback en directo.
- **Extracción de acapellas**: aplicar `UVR-MDX-NET-Inst_HQ_3.onnx` o `UVR_MDXNET_Main.onnx` para aislar la voz y reutilizarla en remezclas, samples o vídeos, con la salvedad de los derechos de la obra original.
- **Preprocesado para transcripción musical**: separar la pista de voz antes de pasarla a un sistema de reconocimiento de letras o de alineación forzada, reduciendo la interferencia de la instrumentación.
- **Remezcla y producción**: con `htdemucs_embedded.onnx` obtener batería, bajo y resto por separado para sustituir o procesar cada elemento de forma independiente en un DAW.
- **Aplicaciones web en el navegador**: la exportación ONNX de HTDemucs permite ejecutar la separación en cliente con ONNX Runtime Web, sin enviar el audio a un servidor, útil para herramientas de privacidad.
- **Automatización por lotes de catálogos**: procesar álbumes completos con scripts que invoquen los modelos ONNX en local, generando versiones instrumentales de forma reproducible.
- **Investigación en separación de fuentes**: usar los pesos como línea base para comparar métricas SDR entre MDX-Net y HTDemucs en un mismo conjunto de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única referencia numérica es la que aparece en el nombre del archivo `UVR_MDXNET_3_9662.onnx`, que alude a un valor de 96,62 SDR, pero el repositorio no aporta la metodología ni el conjunto de evaluación, por lo que no se puede verificar ni comparar de forma rigurosa.

## Requisitos de hardware

- **VRAM estimada**: los modelos MDX-Net (28-64 MB) y HTDemucs (172 MB) son muy ligeros; la inferencia cabe holgadamente en menos de 1 GB de VRAM, y en la mayoría de casos funciona en CPU.
- **GPU recomendadas**: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML) acelera el proceso; una RTX 3060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el reducido tamaño de los modelos.
- **Consumer GPU**: sí, cabe en cualquier GPU de consumo moderna e incluso en iGPU mediante CPU/WebGPU.
- **Opciones de despliegue**: ONNX Runtime (Python, C++, C#), ONNX Runtime Web para navegador, integración en la GUI de Ultimate Vocal Remover, y scripts propios con `onnxruntime` o `optimum`. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de audio.
- **Latencia y throughput**: no disponibles en la información proporcionada; dependerán del hardware, de la duración del audio y del modelo elegido.

## Comparativa con modelos similares

| Modelo | Arquitectura | Stems | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Acapellas/uvr5-models` (este repo) | MDX-Net + HTDemucs | 2 (voz/instrumental) y 4 | 0,4 GB total | MIT | Hugging Face |
| UVR (repositorio original) | MDX-Net y variantes | 2 y 4 | variable | MIT | GitHub releases |
| Demucs / HTDemucs (Meta AI) | Transformer híbrido | 4 | ~300 MB (pesos originales) | MIT | GitHub, PyTorch Hub |
| Spleeter (Deezer) | U-Net | 2, 4 o 5 | ~100 MB | MIT | GitHub |

La comparativa se limita a aspectos de arquitectura, tamaño y licencia, ya que no se dispone de métricas de calidad verificables en la información proporcionada para establecer una comparación cuantitativa de SDR.

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no procesa texto ni mantiene conversaciones; cualquier uso en ese sentido es inadecuado.
- **Calidad dependiente del material**: la separación puede introducir artefactos en mezclas con reverberación intensa, coros densos o instrumentación que solape el rango vocal.
- **Sin métricas verificables**: el valor "96,62 SDR" del nombre de archivo no viene acompañado de metodología ni conjunto de evaluación.
- **Riesgo legal en el contenido de entrada**: separar voces de obras protegidas no otorga derechos sobre ellas; el uso comercial de las pistas resultantes requiere autorización de los titulares.
- **Repositorio espejo sin mantenimiento declarado**: no está afiliado a los autores originales y puede quedar desactualizado respecto a las releases canónicas.
- **Idioma**: la etiqueta `en` del repositorio no implica soporte lingüístico; el modelo es agnóstico al idioma del audio.
- **Licencia MIT**: permite uso comercial y redistribución, pero obliga a conservar el aviso de copyright y el texto de licencia que acompaña a cada archivo `.LICENSE`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Acapellas/uvr5-models
- Artículo KUIELab-MDX-Net: https://arxiv.org/abs/2111.12203
- Artículo Hybrid Transformers for Music Source Separation: https://arxiv.org/abs/2211.00847
- Proyecto Ultimate Vocal Remover: https://github.com/Anjok07/ultimatevocalremovergui
- Distribución original de modelos UVR: https://github.com/TRvlvr/model_repo
- Proyecto Demucs: https://github.com/facebookresearch/demucs
- Conversión ONNX de Demucs: https://huggingface.co/timcsy/demucs-web-onnx
- Guía práctica de UVR5: https://tomodahinata.com/en/blog/uvr5-karaoke-instrumental-acapella-vocal-extraction-guide
- Texto de la licencia MIT: https://opensource.org/licenses/MIT
