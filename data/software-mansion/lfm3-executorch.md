# software-mansion/LFM3-ExecuTorch

## Resumen

LFM3-ExecuTorch es un repositorio de exportaciones en formato ExecuTorch, preparado por Software Mansion, de tres modelos de la familia LFM3 de Liquid AI: LFM3-1.7B (texto), LFM3-VL-2B (visión-lenguaje) y LFM3-Audio-2B (entrada de audio, salida de texto). El objetivo del proyecto es facilitar la ejecución de estos modelos directamente en dispositivos móviles (iOS y Android) mediante la librería react-native-executorch, permitiendo integrar capacidades de IA generativa, multimodal y de audio en aplicaciones React Native sin depender de servicios en la nube.

El modelo base, LFM3-1.7B, pertenece a la familia de modelos LFM (Liquid Foundation Models) de Liquid AI, caracterizada por arquitecturas híbridas que combinan capas transformer con unidades convolucionales de memoria (LFM), optimizadas para inferencia eficiente en hardware con recursos limitados. Las exportaciones incluyen variantes cuantizadas (XNNPACK 8da4w, MLX int4 e int8) que reducen la huella de memoria y aceleran la inferencia en CPU y en aceleradores móviles.

Este repositorio es relevante porque cubre un hueco importante del ecosistema: la ejecución local de modelos multimodales modernos en apps móviles, con soporte de contexto de 8192 tokens y variantes optimizadas para distintas plataformas. Es especialmente útil para desarrolladores React Native que buscan privacidad, latencia baja y funcionamiento sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM (Liquid Foundation Model), exportada a ExecuTorch |
| Parametros totales | 1,7B (LFM3-1.7B), 2B (LFM3-VL-2B y LFM3-Audio-2B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | XNNPACK 8da4w, MLX int4, MLX int8 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | ExecuTorch (.pte), con variantes MLX int4/int8 |

## Arquitectura y entrenamiento

Las exportaciones se basan en tres modelos de Liquid AI. LFM3-1.7B es un modelo de texto de 1,7 mil millones de parametros; LFM3-VL-2B añade capacidades de visión-lenguaje sobre una base de 2B; y LFM3-Audio-2B acepta audio como entrada y genera texto, lo que habilita casos como transcripcion o comprension de comandos de voz. La familia LFM emplea arquitecturas hibridas disenhadas para inferencia eficiente, con buena relacion calidad/latencia en dispositivos con recursos limitados.

No se dispone de detalles sobre el proceso de entrenamiento de los modelos base (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada. Lo que si queda documentado es el proceso de exportacion: los pesos originales se han convertido al formato ExecuTorch de PyTorch, con cuantizacion 8da4w (pesos a 8 bits, activaciones a 4 bits) para el backend XNNPACK, y cuantizacion int4/int8 para el framework MLX (plataformas Apple Silicon). El tamano del repositorio, 17,8 GB, refleja la inclusion de las tres variantes de modelo en multiples formatos de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno (LFM3-1.7B) con ventana de contexto de 8192 tokens.
- Comprension de imagenes y razonamiento visual-textual (LFM3-VL-2B), util para describir imagenes o responder preguntas sobre contenido visual.
- Comprension de audio con salida de texto (LFM3-Audio-2B): transcripcion, comandos de voz y analisis de contenido sonoro.
- Ejecucion 100% en dispositivo (on-device) mediante ExecuTorch, sin envio de datos a la nube.
- Integracion directa en aplicaciones React Native a traves de la libreria react-native-executorch.
- Variantes optimizadas por plataforma: XNNPACK 8da4w para CPU (Android/iOS) y MLX int4/int8 para Apple Silicon.
- No se dispone de informacion sobre soporte de tool calling, agentes ni thinking mode en la documentacion proporcionada.

## Casos de uso

- Asistentes de chat offline en apps moviles: LFM3-1.7B puede ejecutarse localmente con react-native-executorch, ofreciendo conversacion multi-turno sin conexion y sin coste de API, adecuado para apps con requisitos de privacidad.
- Analisis de imagenes en el dispositivo: con LFM3-VL-2B, una app puede describir fotografias, extraer informacion visual o responder preguntas sobre imagenes sin subirlas a un servidor, util en apps de accesibilidad o gestion de galerias.
- Transcripcion y comandos de voz: LFM3-Audio-2B permite procesar audio del microfono directamente en el telefono, habilitando dictado, notas de voz a texto o control por voz de la aplicacion.
- Aplicaciones con requisitos de cumplimiento (salud, finanzas, sector publico): al procesar todo en local, los datos sensibles nunca abandonan el dispositivo, simplificando el cumplimiento del RGPD.
- Funcionalidades de IA en zonas sin cobertura: turismoguías, apps de campo o entornos industriales donde la conectividad no esta garantizada pueden mantener capacidades de IA gracias a la inferencia on-device.
- Prototipado rapido de funciones de IA en React Native: la libreria react-native-executorch permite a equipos frontend anhadir LLMs a sus apps con pocas lineas de codigo, sin infraestructura de backend.
- Reduccion de costes operativos: desplazar la inferencia al dispositivo elimina el coste por token de APIs en la nube para funcionalidades de alto volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para metricas de los modelos base (LFM3-1.7B, LFM3-VL-2B, LFM3-Audio-2B), conviene consultar las model cards originales de LiquidAI en HuggingFace.

## Requisitos de hardware

- Al tratarse de exportaciones on-device, los requisitos se miden en RAM del movil mas que en VRAM: con cuantizacion 8da4w, un modelo de 1,7B ocupa aproximadamente 2 GB de memoria; el int4 de MLX reduce esa cifra a torno a 1-1,2 GB (estimaciones orientativas, no confirmadas en la documentacion).
- Moviles Android con 6-8 GB de RAM o mas para una ejecucion fluida; iPhones recientes (con Apple Silicon, A14 o superior recomendable) para las variantes MLX.
- No requiere GPU dedicada ni servidores: esta disenado para CPU de movil (backend XNNPACK) y aceleradores de Apple (MLX).
- Despliegue mediante la libreria react-native-executorch (npm) en apps React Native; no es aplicable el despliegue con vLLM, TGI, llama.cpp u Ollama, ya que el formato ExecuTorch esta orientado a entornos moviles y embebidos.
- Latencia y throughput: no disponible; se recomienda medir en el dispositivo objetivo, ya que dependen del chipset y de la variante de cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-ExecuTorch (LFM3-1.7B / VL-2B / Audio-2B) | 1,7B / 2B | 8192 | Texto, vision, audio | ExecuTorch (.pte) | LFM Open License v1.0 |
| Qwen3-1.7B (GGUF/on-device) | 1,7B | no disponible en esta ficha | Texto | GGUF, safetensors | Apache 2.0 |
| Gemma 3 1B/4B | 1B / 4B | 32K (según ficha oficial) | Texto y vision (4B) | safetensors, GGUF | Gemma Terms of Use |

Nota: la comparativa se ofrece a titulo orientativo. La ventaja diferencial de LFM3-ExecuTorch no radica en los pesos en si, sino en las exportaciones listas para uso movil con react-native-executorch y en la cobertura multimodal (vision y audio) en tamaanos tan reducidos. Verifica siempre los datos de las alternativas en sus fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 no es una licencia permisiva estandar (no es Apache 2.0 ni MIT); revisa sus terminos en el enlace proporcionado antes de cualquier uso comercial, ya que puede incluir restricciones de uso o de numero de usuarios.
- Las capacidades de los modelos son las de sus versiones base de 1,7B-2B: en tareas de razonamiento complejo, codigo avanzado o matematicas, quedaran por detras de modelos de mayor tamano.
- No se documenta el soporte de idiomas de los modelos base; verifica la cobertura multilingue en las model cards de LiquidAI antes de usarlos en castellano.
- El repositorio ocupa 17,8 GB al incluir tres modelos en multiples variantes; descarga solo los directorios necesarios (1_7b/, vl_2b/, audio_2b/).
- No se publica documentacion sobre tool calling, agentes ni alucinacion conocida en esta ficha; evalua el comportamiento del modelo en tu dominio antes de pasar a produccion.
- Al tratarse de un repositorio de exportacion mantenido por Software Mansion (no por Liquid AI), el soporte y las actualizaciones dependen de ambos proyectos; el repositorio es muy reciente (creado en octubre de 2026) y tiene muy pocas descargas, por lo que la madurez comunitaria es limitada.
- La cuantizacion (8da4w, int4, int8) implica una pequenha degradacion de calidad respecto a los pesos originales; valida la precision en tu caso de uso.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/software-mansion/LFM3-ExecuTorch
- Modelo base LFM3-1.7B: https://huggingface.co/LiquidAI/LFM3-1.7B
- Modelo base LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Modelo base LFM3-Audio-2B: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Libreria react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
