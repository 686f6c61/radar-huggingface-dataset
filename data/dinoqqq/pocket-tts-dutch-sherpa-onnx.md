# dinoqqq/pocket-tts-dutch-sherpa-onnx

## Resumen

`dinoqqq/pocket-tts-dutch-sherpa-onnx` es una conversión al formato ONNX del modelo de síntesis de voz Pocket TTS de Kyutai Labs, en su variante para neerlandés. El autor, el usuario de Hugging Face `dinoqqq`, ha exportado los pesos originales al layout que espera la librería sherpa-onnx, aplicando cuantización dinámica int8, lo que reduce el tamaño del repositorio a 0,1 GB y permite ejecución en dispositivo (on-device) sin GPU dedicada.

El modelo resuelve el problema de la síntesis de voz multilingüe con clonación de voz zero-shot en entornos con recursos limitados: al estar en ONNX int8 y seguir el layout de sherpa-onnx, puede integrarse en aplicaciones móviles, sistemas embebidos y servicios de escritorio sin depender de PyTorch ni de infraestructura de servidor. La variante neerlandesa se deriva de `kyutai/pocket-tts` `languages/dutch`, con una arquitectura de flow LM de 6 capas y una configuración específica (`insert_bos_before_voice: true`).

La relevancia actual del modelo radica en su enfoque práctico: no compite en calidad absoluta con los grandes sistemas TTS comerciales, sino en viabilidad de despliegue. La inclusión de una muestra de referencia de 6,8 segundos en neerlandés derivada de Mozilla Common Voice (CC0) facilita la clonación de voz sin necesidad de datos adicionales, y la licencia CC BY 4.0 de los pesos permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow LM (6 capas) + Mimi encoder/decoder + text conditioner, exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (todos los ficheros `.onnx` son int8) |
| Idiomas soportados | neerlandes (variante `dutch` de Pocket TTS) |
| Licencia | CC BY 4.0 (pesos y derivados ONNX, Kyutai Labs); muestra de referencia CC0 (Mozilla Common Voice) |
| Formato de pesos | ONNX (int8), vocab.json, token_scores.json, WAV de referencia a 24 kHz mono PCM |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Pocket TTS de Kyutai: un flow LM de 6 capas que actúa como generador principal, acompañado de un encoder y un decoder Mimi (el codec neuronal de Kyutai) y un text conditioner que proyecta la secuencia de texto a un espacio compatible con el flow. La variante neerlandesa activa `insert_bos_before_voice: true`, un ajuste que inserta un token de inicio antes de la referencia de voz para condicionar la clonación. La exportación a ONNX se realizó con el pipeline de KevinAHM/pocket-tts-onnx-export (fork de lomotron), que aplica cuantización dinámica int8 a los módulos del flow LM, encoder, decoder y text conditioner.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la información proporcionada. La model card solo indica la procedencia (exportación desde `kyutai/pocket-tts` `languages/dutch`) y que la muestra de referencia deriva de `cml_tts_nl_11290_9412_000030_0001.flac` de Mozilla Common Voice, convertida a 24 kHz mono PCM WAV. La innovación técnica destacable es la combinación de clonación zero-shot con un pipeline de exportación que preserva la funcionalidad en un formato portable y cuantizado.

## Capacidades

- Síntesis de voz (TTS) en neerlandés a 24 kHz.
- Clonación de voz zero-shot a partir de una muestra de referencia de audio (la incluida es de 6,8 s).
- Ejecución on-device mediante sherpa-onnx, sin dependencia de PyTorch en tiempo de inferencia.
- Cuantización int8 que reduce el tamaño y los requisitos de cómputo.
- Integración con el ecosistema sherpa-onnx (aplicaciones móviles, escritorio, embebidos).
- No se documenta soporte de tool calling, agentes, razonamiento multi-step ni otras capacidades de texto: es un modelo exclusivamente TTS.
- Capacidad multilingüe limitada al neerlandés en esta variante.

## Casos de uso

- **Aplicaciones móviles de accesibilidad**: lectura en voz alta de textos en neerlandés para personas con discapacidad visual, ejecutando el modelo en el propio dispositivo gracias al formato ONNX int8 y al tamaño reducido del repositorio (0,1 GB).
- **Asistentes de voz embebidos**: integración en dispositivos IoT o sistemas empotrados que necesiten síntesis de voz neerlandesa sin conexión a la nube, usando sherpa-onnx como runtime.
- **Clonación de voz personalizada en local**: generación de locuciones con una voz concreta a partir de una muestra de referencia, útil en aplicaciones de audiolibros o podcasts donde se quiera mantener una identidad vocal consistente.
- **Sistemas de navegación o kioscos interactivos**: anuncios de voz en neerlandés en entornos con recursos limitados, donde la latencia y el consumo energético importan más que la calidad absoluta.
- **Prototipado rápido de productos TTS**: evaluación de la calidad de Pocket TTS en neerlandés antes de invertir en infraestructura de servidor, gracias a la portabilidad del formato ONNX.
- **Investigación en TTS multilingüe**: comparación de la variante neerlandesa con otras variantes de Pocket TTS para estudiar el comportamiento de la clonación zero-shot por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita; al estar cuantizado a int8 y con un repositorio de 0,1 GB, la huella de memoria es reducida y compatible con ejecución en CPU.
- **GPU recomendadas**: no se especifican; el modelo está pensado para inferencia on-device, por lo que la CPU es el objetivo principal. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) podría ejecutarlo, pero no hay datos de rendimiento publicados.
- **Compatibilidad con GPU consumer**: sí, por el tamaño reducido, aunque no se documentan cifras de latencia ni throughput.
- **Opciones de despliegue**: sherpa-onnx (runtime principal), y en general cualquier runtime compatible con ONNX (ONNX Runtime).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `dinoqqq/pocket-tts-dutch-sherpa-onnx` | no disponible | no disponible | neerlandes | CC BY 4.0 | ONNX int8 |
| `kyutai/pocket-tts` (variante dutch) | no disponible | no disponible | neerlandes | no disponible en la informacion | pesos originales (no ONNX) |
| `kyutai/pocket-tts` (otras variantes) | no disponible | no disponible | otros idiomas | no disponible en la informacion | pesos originales (no ONNX) |

No se dispone de información suficiente sobre modelos TTS comparables (por ejemplo, variantes de Piper, Coqui o VITS en neerlandés) en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- **Idioma único**: la variante está entrenada y configurada exclusivamente para neerlandés; no se garantiza un comportamiento correcto en otros idiomas.
- **Calidad de clonación dependiente de la referencia**: la clonación zero-shot depende de la muestra de audio proporcionada; la incluida es de 6,8 s y de dominio público, pero su calidad condiciona el resultado.
- **Riesgo de uso indebido**: la model card advierte explícitamente de que no se presente el habla generada como una grabación auténtica de una persona real; existe riesgo de suplantación de identidad si se clona una voz sin consentimiento.
- **Licencia**: los pesos y derivados ONNX son CC BY 4.0, lo que permite uso comercial con atribución a Kyutai Labs; la muestra de referencia es CC0. Es necesario verificar el cumplimiento de atribución en producción.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al derivar de Mozilla Common Voice, puede heredar los sesgos de dicho corpus.
- **Alucinación en TTS**: como todo modelo generativo de audio, puede producir pronunciaciones incorrectas o artefactos en textos fuera de distribución; no hay datos publicados sobre tasas de error.
- **Sin benchmarks**: la ausencia de métricas publicadas (MOS, WER, latencia) impide evaluar su calidad frente a alternativas.
- **Mantenimiento**: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-15), lo que sugiere un proyecto reciente y sin validación comunitaria.

## Enlaces

- [Hugging Face: dinoqqq/pocket-tts-dutch-sherpa-onnx](https://huggingface.co/dinoqqq/pocket-tts-dutch-sherpa-onnx)
- [Modelo original: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Repositorio sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- [Pipeline de exportación: KevinAHM/pocket-tts-onnx-export](https://github.com/KevinAHM/pocket-tts-onnx-export)
- [Fork del pipeline: lomotron/pocket-tts-onnx-export](https://github.com/lomotron/pocket-tts-onnx-export)
