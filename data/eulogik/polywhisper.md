# eulogik/polywhisper

## Resumen

PolyWhisper v9 es un sistema de reconocimiento automático del habla (ASR) desarrollado por Eulogik, orientado a cinco lenguas de la India: hindi, tamil, telugu, bengalí y maratí. Su planteamiento es poco convencional: en lugar de reentrenar un modelo completo por idioma, congela el backbone de OpenAI Whisper-Small (244M parámetros) y entrena adaptadores LoRA independientes por lengua de unos 14 MB cada uno, lo que reduce el almacenamiento por idioma aproximadamente cien veces respecto a un fine-tuning completo.

La propuesta resulta relevante para el despliegue en entornos con recursos limitados: los adaptadores son intercambiables sobre un único backbone compartido y el autor publica artefactos ONNX cuantizados en INT8 que permiten inferencia en CPU sin GPU. El modelo se distribuye con licencia MIT, lo que facilita su uso comercial y su integración en productos.

Los resultados declarados son desiguales. Las mejoras más claras se concentran en bengalí (WER de 181,3 a 130,2) y maratí (de 474,9 a 116,9) frente a la variante sin aumento de datos, mientras que hindi y tamil empeoran ligeramente y el WER absoluto en varias lenguas sigue siendo alto (telugu 100,1, bengalí 130,2, maratí 116,9), lo que sitúa al sistema en un estadio de investigación más que de producción para esas lenguas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-Small (encoder-decoder transformer) congelado + adaptadores LoRA por idioma (PEFT) |
| Parametros totales | 244M (backbone Whisper-Small); adaptadores LoRA de ~14 MB por idioma |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper: 30 s por segmento) |
| Tipos de cuantizacion | ONNX INT8 (artefactos publicados); cuantizaciones adicionales no disponibles |
| Idiomas soportados | hindi (hi), tamil (ta), telugu (te), bengalí (bn), maratí (mr); inglés (en) heredado del backbone |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers/PEFT) y ONNX |

## Arquitectura y entrenamiento

El sistema parte de openai/whisper-small, un transformer encoder-decoder con 244M parámetros, y lo mantiene congelado. Sobre él se entrenan cinco adaptadores LoRA, uno por lengua, que se activan de forma intercambiable según el idioma de entrada. Esta separación permite compartir un único backbone en memoria y cargar solo el adaptador correspondiente, con un coste de almacenamiento de aproximadamente 14 MB por idioma frente a los ~1,5 GB de un fine-tuning completo.

Los datos de entrenamiento provienen de ai4bharat/indicvoices-st y google/fleurs. La innovación metodológica declarada por el autor es el hallazgo de la versión 9: aplicar SpecAugment y perturbación de velocidad de forma global daña hindi y tamil (provoca degeneración en bucles de tokens), mientras que beneficia mucho a bengalí y maratí. La receta final aumenta datos únicamente en bn y mr y entrena hi, ta y te sin aumento. No se especifica en la información disponible el número total de tokens ni de horas de audio utilizadas, ni si hubo RLHF o DPO (no aplicable en un modelo ASR).

## Capacidades

- Transcripción de voz a texto en hindi, tamil, telugu, bengalí y maratí.
- Conmutación de idioma mediante carga del adaptador LoRA correspondiente sobre un backbone compartido.
- Inferencia en CPU gracias a los artefactos ONNX cuantizados en INT8, sin necesidad de GPU.
- Compatibilidad con la librería transformers y con el pipeline automatic-speech-recognition.
- Integración con PEFT para gestionar y sustituir adaptadores.
- Reconocimiento de habla en escrituras devanagari (hi, mr), tamil (ta), telugu (te) y bengalí (bn).
- No se declaran capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones y notas de voz en hindi y maratí: el modelo permite convertir audio de 30 segundos por segmento en texto en escritura devanagari, adecuado para herramientas internas de documentación en equipos con personal que trabaja en esas lenguas.
- Subtitulado de contenido audiovisual en tamil: con un WER declarado de 70,1 en FLEURS, es utilizable para subtítulos de borrador que después se revisan manualmente, no para subtitulado automático sin supervisión.
- Procesamiento por lotes en servidores sin GPU: los artefactos ONNX INT8 permiten ejecutar la transcripción en CPU, lo que encaja en pipelines de digitalización de archivos de audio en infraestructura convencional.
- Investigación en ASR de bajos recursos: la separación backbone congelado + LoRA por idioma sirve como base reproducible para experimentar con nuevas lenguas o recetas de aumento de datos sin reentrenar el modelo completo.
- Prototipado de asistentes de voz para bengalí y maratí: son las lenguas donde la receta v9 aporta mejoras relativas mayores frente a la variante sin aumento, por lo que resultan las candidatas más razonables para pruebas de concepto.
- Despliegue en dispositivos edge: el tamaño reducido de cada adaptador (~14 MB) y la cuantización INT8 facilitan empaquetar el sistema en entornos con almacenamiento y memoria limitados.
- Evaluación comparativa de adaptadores: al compartir backbone, permite medir el efecto de distintos adaptadores sobre el mismo audio sin variar el resto del pipeline.

## Benchmarks y rendimiento

Resultados declarados por el autor (FLEURS, beam=1, WER normalizado, no verificados de forma independiente):

| Idioma | Código | v7 (sin aumento) | v9 final | Variación |
|---|---|---|---|---|
| Hindi | hi | 43,0 | 46,3 | +7,7% (empeora) |
| Tamil | ta | 68,2 | 70,1 | +2,8% (empeora) |
| Telugu | te | 103,0 | 100,1 | −2,8% (mejora) |
| Bengalí | bn | 181,3 | 130,2 | −28,2% (mejora) |
| Maratí | mr | 474,9 | 116,9 | −75,4% (mejora) |

No se han publicado en la información disponible resultados de benchmarks frente a otros sistemas ASR (por ejemplo, Whisper-Small sin adaptar, IndicWhisper o modelos de AI4Bharat) más allá de la comparación interna entre variantes v7 y v9 del propio proyecto.

## Requisitos de hardware

- VRAM estimada: el backbone Whisper-Small en FP16 ocupa aproximadamente 0,5 GB; en FP32, alrededor de 1 GB. Los adaptadores LoRA añaden ~14 MB cada uno. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es suficiente, aunque el modelo está pensado para no requerir GPU.
- GPU consumer: sí, cabe en tarjetas de gama baja e incluso en CPU mediante ONNX INT8.
- Opciones de despliegue: transformers con PEFT, ONNX Runtime (artefactos INT8 publicados). No se confirma soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo ASR de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas indios | Licencia | Formato |
|---|---|---|---|---|---|
| PolyWhisper v9 | 244M + LoRA (~14 MB/idioma) | 30 s por segmento | hi, ta, te, bn, mr | MIT | safetensors, ONNX |
| openai/whisper-small | 244M | 30 s por segmento | multilingüe (incluye hi, ta, te, bn, mr) | MIT | safetensors, ONNX |
| Whisper fine-tune completo por idioma | ~244M por idioma | 30 s por segmento | uno por modelo | depende del autor | safetensors |
| Modelos ASR de AI4Bharat (IndicWhisper) | no disponible en la información | no disponible | varias lenguas indias | no disponible | no disponible |

La comparación cuantitativa con alternativas externas no está disponible: la model card solo ofrece métricas frente a las variantes v7 y v9 del propio proyecto.

## Limitaciones y advertencias

- WER absoluto alto en varias lenguas (telugu 100,1; bengalí 130,2; maratí 116,9), lo que limita su uso en producción sin revisión humana en esos idiomas.
- Hindi y tamil empeoran respecto a la variante v7 (43,0 → 46,3 y 68,2 → 70,1), un retroceso que el autor atribuye a la receta de aumento de datos.
- Los resultados del model-index están marcados como no verificados; proceden del propio autor y no de una evaluación independiente.
- Riesgo de degeneración en bucles de tokens documentado por el autor al aplicar aumento de datos global, lo que sugiere sensibilidad a la distribución del audio de entrada.
- No se documentan sesgos específicos por dialecto, género o registro, ni el comportamiento ante audio con ruido, acentos regionales o cambios de código entre lenguas.
- Cobertura limitada a cinco lenguas indias más el inglés heredado del backbone; no se declaran otras lenguas.
- El tamaño del repositorio (16,1 GB) es muy superior al de los pesos del modelo, probablemente por artefactos auxiliares; conviene revisar qué se descarga antes de integrarlo en un pipeline.
- Aunque la licencia MIT permite uso comercial, la ausencia de evaluación independiente y los WER elevados desaconsejan desplegarlo sin una validación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/polywhisper
- Repositorio GitHub: https://github.com/eulogik/PolyWhisper
- Releases del proyecto: https://github.com/eulogik/PolyWhisper/releases
- Sitio del autor: https://eulogik.com
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset IndicVoices-ST: https://huggingface.co/datasets/ai4bharat/indicvoices-st
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Licencia MIT: https://opensource.org/licenses/MIT
