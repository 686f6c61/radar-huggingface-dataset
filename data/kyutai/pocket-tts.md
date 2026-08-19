# kyutai/pocket-tts

## Resumen

Pocket TTS es un modelo de síntesis de voz (text-to-speech) desarrollado por Kyutai, un laboratorio de inteligencia artificial centrado en investigación abierta. Con solo 100 millones de parámetros, está diseñado para ejecutarse en tiempo real en CPU, lo que lo hace accesible para dispositivos sin GPU. El modelo ofrece alta calidad de voz y capacidad de clonación de voz, y fue entrenado exclusivamente con datasets públicos en inglés. Su relevancia radica en que democratiza la síntesis de voz de alta calidad al eliminar la necesidad de hardware especializado. Según el reporte técnico, en abril de 2026 se amplió a cinco idiomas adicionales. El modelo se distribuye bajo licencia CC-BY-4.0 en HuggingFace, aunque el reporte técnico menciona MIT. El acceso al repositorio es restringido (gated) y requiere aceptar condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 100 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inicialmente); el reporte tecnico menciona ampliacion a cinco idiomas adicionales en abril de 2026 |
| Licencia | cc-by-4.0 (segun HuggingFace); el reporte tecnico indica MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se ha detallado en la informacion disponible. Segun el reporte tecnico, el modelo tiene 100 millones de parametros y fue entrenado exclusivamente con datasets publicos en ingles. No se especifican detalles sobre el tipo de red (transformer, red convolucional, etc.) ni sobre el proceso de entrenamiento (si se uso RLHF, DPO u otras tecnicas). El modelo esta disenado para ser ligero y eficiente en CPU, logrando una sintesis de voz en tiempo real sin sacrificar la calidad.

## Capacidades

- Sintesis de voz de alta calidad a partir de texto.
- Clonacion de voz (voice cloning) a partir de muestras de audio.
- Ejecucion en tiempo real en CPU, sin necesidad de GPU.
- Soporte multilingue (segun la actualizacion de abril de 2026, aunque inicialmente solo ingles).
- No se mencionan otras capacidades como tool calling, agentes o procesamiento de vision.

## Casos de uso

- Accesibilidad: lectores de pantalla para personas con discapacidad visual, ejecutandose en dispositivos de bajo coste sin GPU.
- Asistentes de voz en dispositivos embebidos: integracion en asistentes personales o sistemas de domotica que funcionan en CPU.
- Audiobooks y narracion: generacion de audiolibros a partir de texto, con clonacion de voz para mantener una voz consistente.
- Doblaje y localizacion: clonacion de voz para doblar contenido en diferentes idiomas (si se amplia el soporte).
- Educacion: herramientas de aprendizaje de idiomas que generan audio de pronunciacion.
- Atencion al cliente: sistemas de respuesta de voz automatizada que funcionan en servidores sin GPU.
- Produccion de contenido: generacion de voces para podcasts o videos, con clonacion de voz para imitar a un locutor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- CPU: corre en CPU en tiempo real, sin necesidad de GPU.
- RAM: no especificada, pero al ser un modelo de 100 millones de parametros, se estima un consumo moderado (probablemente inferior a 1 GB, aunque no se confirma).
- GPU: no requerida.
- Opciones de despliegue: se menciona un servidor (pocket-tts-server) y un port a wasm/onnx para deno, ademas de una demo en linea.
- Latencia: no especificada.

## Comparativa con modelos similares

No se ha proporcionado informacion comparativa con otros modelos TTS en las fuentes consultadas.

## Limitaciones y advertencias

- Acceso restringido (gated) en HuggingFace, requiere aceptar condiciones.
- Licencia CC-BY-4.0 (permite uso comercial con atribucion, aunque el reporte tecnico menciona MIT; hay discrepancia entre fuentes).
- Inicialmente solo ingles, aunque se amplio a cinco idiomas adicionales en abril de 2026.
- No se han documentado sesgos especificos, pero al ser un modelo de voz, puede tener limitaciones en acentos o dialectos.
- No se especifican limitaciones de contexto o longitud de audio.

## Enlaces

- HuggingFace: https://huggingface.co/kyutai/pocket-tts
- GitHub: https://github.com/kyutai-labs/pocket-tts
- Reporte tecnico: https://kyutai.org/pocket-tts-technical-report/
- Demo: https://kyutai-labs.github.io/pocket-tts/ y https://kyutai.org/next/tts/
