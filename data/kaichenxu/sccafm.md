# kaichenxu/scCAFM

## Resumen

scCAFM es un modelo fundacional para análisis de scRNA-seq a gran escala desarrollado por kaichenxu, con código en el repositorio Catchxu/scCAFM. Combina dos módulos: un Structure Foundation Module (SFM) con mezcla de expertos para modelar estructura regulatoria específica de contexto y un Embedding Foundation Module (EFM) que aprende representaciones de genes y células guiado por el orden causal producido por el SFM. La versión publicada contiene 298.957.878 parámetros según el recuento de safetensors de Hugging Face; la model card desglosa 299.995.067 incluyendo el vocabulario compartido.

El modelo se presenta como preentrenado sobre 49,7 millones de células humanas y de ratón, con recursos de factores de transcripción, interacciones de OmniPath y homología entre especies. Su relevancia está en modelar estructura regulatoria a resolución celular en lugar de limitarse a relaciones génicas asociativas, además de producir embeddings transferibles para perturbaciones, trayectorias y predicción de fenotipos. La licencia es GPL-3.0 y los pesos se distribuyen en safetensors F32.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: Structure Foundation Module (SFM) con mezcla de expertos y Embedding Foundation Module (EFM) guiado por el orden causal del SFM. No se especifica el tipo exacto de bloque subyacente. |
| Parámetros totales | 298.957.878 según Hugging Face. La model card suma 299.995.067: SFM 135.393.926, EFM 149.029.941 y vocabulario compartido 15.571.200. |
| Parámetros activos | No disponible. El SFM usa mezcla de expertos, pero no se indica el número de expertos ni los parámetros activos por célula o token. |
| Longitud de contexto | No disponible. No se define una ventana de contexto textual; el modelo opera sobre vocabulario génico y condiciones. |
| Tipos de cuantización | F32 en la versión oficial; no se documentan GGUF, INT8, INT4 ni otras cuantizaciones. |
| Idiomas soportados | No disponible para lenguaje natural. La versión incluye recursos para *Homo sapiens* y *Mus musculus*. |
| Licencia | GPL-3.0. |
| Formato de pesos | safetensors F32; índice raíz `model.safetensors.index.json` y checkpoints separados `models/sfm/sfm_model.safetensors` y `models/efm/efm_model.safetensors`. |
| Precisión | F32. |
| Tensores | 381. |
| Tamaño del repositorio | 11,5 GB declarados en Hugging Face; la vista de archivos mostrada en la búsqueda indica 1,21 GB. Conviene verificar el contenido real antes de descargar. |
| Pipeline de Hugging Face | No disponible. |

## Arquitectura y entrenamiento

scCAFM se organiza en dos etapas. El SFM aprende representaciones estructurales de regulación génica específicas de contexto mediante una arquitectura de mezcla de expertos; produce factores estructurales y un orden causal de genes. El EFM, con el SFM congelado, aprende embeddings de genes y células usando ese orden causal. La tokenización comparte un vocabulario de 15.571.200 parámetros y un diccionario de condiciones; los recursos incluyen listas de factores de transcripción humano y de ratón, interacciones de OmniPath y homología entre especies.

El preentrenamiento se describe sobre 49,7 millones de células humanas y de ratón. No se detallan en la información disponible el número de tokens, la composición exacta del dataset, el esquema de lotes ni si hubo RLHF/DPO; en este dominio no es un modelo de lenguaje y no se documentan etapas de alineamiento humano. Tampoco se especifica el tipo exacto de bloque subyacente del SFM o del EFM más allá del uso de mezcla de expertos en el SFM.

## Capacidades

- Modelado de estructura regulatoria específica de contexto: el SFM infiere factores estructurales y orden causal de genes por contexto celular.
- Generación de embeddings transferibles de genes y células con el EFM para análisis supervisados y no supervisados.
- Inferencia de redes reguladoras génicas específicas de célula (csGRN) a partir de expresión y conocimientos biológicos previos.
- Modelado de respuesta a perturbaciones, trayectorias y linajes celulares, y predicción de fenotipos, según la model card.
- Soporte de dos especies: *Homo sapiens* y *Mus musculus*, con recursos de factores de transcripción y homología.
- Integración de conocimiento previo de OmniPath y de listas de factores de transcripción.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso textual, visión, audio ni modo thinking; no es un modelo de lenguaje.
- Capacidades multilingües: no aplica; no procesa lenguaje natural.

## Casos de uso

- Inferencia de csGRN en un atlas tumoral: usar el SFM para obtener una estructura regulatoria específica de contexto y priorizar reguladores por subpoblación celular; el resultado debe validarse con perturbaciones o evidencia experimental.
- Análisis de perturbaciones in silico: emplear los embeddings del EFM como representación de células y genes para modelar respuestas a perturbaciones y priorizar experimentos en cribados.
- Trazado de trayectorias y linaje: proyectar embeddings de células en estados continuos para estudiar diferenciación, activación o transiciones de linaje.
- Predicción de fenotipos asociados a enfermedad: usar los embeddings como variables de entrada en modelos supervisados para clasificación de muestras o asociación con desenlaces clínicos.
- Integración y transferencia humano-ratón: aprovechar `homologous.csv` y los recursos de ambas especies para mapear señales regulatorias entre modelos animales y datos humanos.
- Anotación celular y agrupamiento: aplicar los embeddings no supervisados para agrupar células y asignar tipos o estados celulares en cohortes scRNA-seq.
- Priorización de factores de transcripción y dianas: combinar `human_tfs.csv`, `mouse_tfs.csv` y las interacciones de OmniPath con la estructura inferida para generar hipótesis sobre reguladores y dianas.
- Análisis de grandes cohortes scRNA-seq: reutilizar un modelo preentrenado en 49,7 millones de células para reducir el entrenamiento desde cero, verificando antes su transferencia al tejido y plataforma de interés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas cuantitativas de csGRN, perturbación, trayectoria o predicción de fenotipos. No hay cifras disponibles para comparar el rendimiento del modelo con alternativas.

## Requisitos de hardware

- VRAM estimada: no hay requisitos oficiales. Como cálculo de solo pesos, 298.957.878 parámetros en F32 ocupan aproximadamente 1,2 GB (298.957.878 × 4 bytes). La VRAM real debe sumar activaciones, tamaño de lote, longitud de entrada y recursos auxiliares.
- GPU recomendadas: no disponible. No se documentan pruebas en A100, H100, RTX 4090 ni otras GPU.
- GPU de consumo: en teoría, los pesos F32 caben en GPUs con al menos 4 GB libres, pero no hay garantía para el pipeline completo ni para lotes grandes. GPUs con 12 GB o 24 GB, como RTX 3060 12 GB, RTX 4070 12 GB o RTX 4090 24 GB, tendrían margen para los pesos y parte del overhead, sin validación oficial.
- Opciones de despliegue: paquete Python oficial desde GitHub (`pip install .`), descarga de assets con `hf download kaichenxu/scCAFM --local-dir assets`, PyTorch y FlashAttention opcional según CUDA, PyTorch, compilador y GPU. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio declara 11,5 GB; la vista de archivos de la búsqueda muestra 1,21 GB. Verificar el contenido antes de aprovisionar.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de alternativas en la información proporcionada. Como modelos de la misma categoría, cabría comparar con scGPT, Geneformer y scFoundation, pero no se aportan especificaciones para hacer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scCAFM | 298.957.878 según Hugging Face; 299.995.067 según la model card | No disponible | No disponible | GPL-3.0 | Hugging Face y GitHub |
| scGPT | No disponible | No disponible | No disponible | No disponible | No disponible |
| Geneformer | No disponible | No disponible | No disponible | No disponible | No disponible |
| scFoundation | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia GPL-3.0: es una licencia copyleft; la distribución de derivados puede obligar a liberar el código fuente correspondiente. Revisar con asesoría legal antes de integrarlo en productos propietarios.
- No hay benchmarks publicados en la información disponible; el rendimiento real en csGRN, perturbación, trayectoria o fenotipo no está cuantificado.
- El repositorio tiene 0 descargas y 0 likes en la información consultada. Esto no mide la calidad técnica, pero indica ausencia de validación comunitaria visible.
- Solo se distribuyen pesos F32; no hay cuantizaciones documentadas, lo que limita despliegues con poca VRAM y aumenta el almacenamiento necesario.
- El tamaño del repositorio es ambiguo: 11,5 GB declarados frente a 1,21 GB en la vista de archivos. Verificar antes de descargar.
- Cobertura de datos: 49,7 millones de células humanas y de ratón, pero no se detalla la composición por tejido, enfermedad, plataforma o protocolo. Puede haber sesgos y falta de transferencia a dominios no representados.
- Soporte limitado a *Homo sapiens* y *Mus musculus*; otras especies no están cubiertas por los recursos de homología.
- Riesgo de inferir relaciones regulatorias espurias: el orden causal y las csGRN son predicciones computacionales y requieren validación experimental, por ejemplo mediante perturbaciones o ensayos con reporteros.
- No es un modelo de lenguaje: no debe evaluarse con MMLU, HumanEval o GSM8K; no soporta tool calling, agentes, visión ni audio.
- No se documentan límites de longitud de entrada, manejo de lotes, calibración ni estabilidad numérica. Es necesario hacer pruebas propias antes de usar el modelo en producción.
- No se documentan sesgos específicos; los sesgos biológicos de los datos de entrenamiento no se cuantifican en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaichenxu/scCAFM
- Archivos del modelo: https://huggingface.co/kaichenxu/scCAFM/tree/main
- Repositorio GitHub: https://github.com/Catchxu/scCAFM
- README del repositorio: https://github.com/Catchxu/scCAFM/blob/main/
- Licencia GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.en.html
- Ficha de terceros: https://essamamdani.com/ai-models/hf-kaichenxu-sccafm
- Paper, demo o blog: no disponibles en la información proporcionada.
