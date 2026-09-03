# software-mansion/react-native-executorch-supertonic

## Resumen

El modelo `software-mansion/react-native-executorch-supertonic` es una exportación del sintetizador de voz Supertonic 3, preparado específicamente para ejecutarse en dispositivos móviles a través de la librería React Native ExecuTorch. Desarrollado por Software Mansion, este modelo realiza conversión de texto a voz (TTS) en más de 30 idiomas, con una única voz por idioma, y está pensado para integrarse en aplicaciones móviles con requisitos de baja latencia y ejecución local.

La arquitectura se compone de cuatro sub-modelos que operan secuencialmente: un predictor de duración, un codificador de texto, un estimador de vector basado en flow-matching y un vocoder que genera la forma de onda final a 44,1 kHz. El modelo está exportado en formato `.pte` de ExecuTorch, con dos backends disponibles: XNNPACK para CPU y MLX para GPU en Apple Silicon. Su licencia es OpenRAIL, lo que permite uso comercial con ciertas restricciones.

La relevancia de este modelo radica en su capacidad de ejecutar síntesis de voz de alta calidad directamente en el dispositivo, sin necesidad de conexión a servidores externos, lo que reduce costes y mejora la privacidad. Con un factor de tiempo real (RTF) de aproximadamente 0,07 en CPU y 0,026 en GPU Apple Silicon, es significativamente más rápido que el tiempo real, lo que lo hace adecuado para aplicaciones interactivas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo TTS compuesto por 4 sub-modelos secuenciales: predictor de duración, codificador de texto, estimador de vector (flow-matching) y vocoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es TTS) |
| Tipos de cuantizacion | no especificado (los archivos .pte pueden incluir cuantización interna) |
| Idiomas soportados | en, es, fr, pl, el, id, zh, ja, ru, tr, da, et, hr, pt, vi, sl, cs, it, uk, ko, sv, lv, hu, fi, ar, nl, sk, bg, hi, de, lt (30+ idiomas) |
| Licencia | OpenRAIL |
| Formato de pesos | `.pte` (ExecuTorch) con backends XNNPACK (CPU) y MLX (Apple Silicon GPU) |

## Arquitectura y entrenamiento

El modelo se basa en Supertonic 3, un sistema TTS de última generación. La arquitectura se divide en cuatro componentes que se ejecutan de manera secuencial:

1. **Predictor de duración**: estima la duración temporal de cada segmento de habla a partir del texto de entrada.
2. **Codificador de texto**: transforma el texto en una representación condicionada por el estilo de voz.
3. **Estimador de vector**: utiliza un denoiser basado en flow-matching para generar el latente de audio.
4. **Vocoder**: decodifica el latente en una forma de onda de 44,1 kHz.

El modelo se exportó con ExecuTorch v1.3.1, y no se garantiza compatibilidad hacia adelante. El entrenamiento original fue realizado por Supertone, aunque no se proporcionan detalles sobre el dataset, el número de tokens ni el proceso de alineación. La exportación a ExecuTorch fue realizada por Software Mansion para su uso en React Native.

## Capacidades

- Síntesis de voz a partir de texto en más de 30 idiomas, con una única voz por idioma (predefinida).
- Generación de audio a 44,1 kHz de frecuencia de muestreo.
- Ejecución local en dispositivos móviles mediante ExecuTorch, sin necesidad de conexión a servidores.
- Dos backends de inferencia: XNNPACK para CPU (optimizado) y MLX para GPU en Apple Silicon.
- Cada archivo `.pte` expone dos métodos: `forward` para la inferencia y `get_dynamic_dims_forward` para validación de dimensiones de entrada en tiempo de ejecución.
- Compatible con el ecosistema React Native a través de la librería `react-native-executorch`.

## Casos de uso

- **Aplicaciones de accesibilidad**: conversión de texto a voz para personas con discapacidad visual o dificultades de lectura. El modelo puede ejecutarse localmente en el dispositivo, garantizando privacidad y funcionamiento sin conexión.
- **Asistentes de voz en aplicaciones móviles**: integración en apps de productividad o domótica para leer notificaciones, mensajes o comandos. Su baja latencia (RTF ~0,07 en CPU) permite respuestas casi inmediatas.
- **Aprendizaje de idiomas**: generación de pronunciación correcta en 30+ idiomas para aplicaciones educativas. El modelo puede leer palabras o frases en el idioma objetivo con una voz clara.
- **Audioguías y contenido narrado**: creación de audio narrado para guías turísticas, libros electrónicos o resúmenes de noticias dentro de una app móvil, sin depender de servicios en la nube.
- **Sistemas de navegación y alertas**: lectura de indicaciones de navegación, alertas de seguridad o mensajes del sistema en vehículos o dispositivos portátiles, donde la baja latencia es crítica.
- **Pruebas de accesibilidad en desarrollo**: los desarrolladores pueden usar el modelo para validar la accesibilidad de sus apps generando audio de prueba en diferentes idiomas sin necesidad de grabaciones humanas.
- **Aplicaciones de comunicación aumentativa**: dispositivos de comunicación para personas con dificultades del habla, permitiendo escribir texto y convertirlo en voz en tiempo real.

## Benchmarks y rendimiento

La model card proporciona el factor de tiempo real (RTF) medido en Apple Silicon, que indica la relación entre el tiempo de procesamiento y la duración del audio generado. Un RTF inferior a 1 significa que el modelo es más rápido que el tiempo real.

| Backend | Descripcion | RTF (Apple Silicon) | Velocidad |
|---|---|---|---|
| XNNPACK | CPU optimizado mediante delegado XNNPACK | ~0,07 | 14× más rápido que el tiempo real |
| MLX | GPU Apple Silicon mediante delegado MLX | ~0,026 | 38× más rápido que el tiempo real |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Plataformas objetivo**: dispositivos móviles con soporte para ExecuTorch (iOS y Android) a través de React Native.
- **GPU recomendadas**: no se especifican GPUs de escritorio; el modelo está diseñado para ejecutarse en dispositivos móviles. El backend MLX requiere Apple Silicon (M1 o posterior).
- **VRAM estimada**: no disponible. El tamaño del repositorio es de 3,0 GB, lo que sugiere que los archivos `.pte` pueden ocupar varios cientos de MB cada uno, pero el consumo de memoria en inferencia no se ha publicado.
- **Opciones de despliegue**: el modelo se integra mediante la librería `react-native-executorch` (https://github.com/software-mansion/react-native-executorch). No se mencionan otros entornos como vLLM o llama.cpp, ya que no es un LLM.
- **Latencia y throughput**: RTF de ~0,07 en CPU y ~0,026 en GPU Apple Silicon, lo que implica que un audio de 10 segundos se genera en aproximadamente 0,7 segundos (CPU) o 0,26 segundos (GPU).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos TTS en la información proporcionada. Modelos comparables en el ámbito del TTS local podrían incluir Piper, Coqui TTS o VITS, pero no se han publicado métricas de rendimiento para establecer una comparación cuantitativa. La ventaja principal de este modelo es su integración específica con ExecuTorch para React Native, lo que facilita su despliegue en aplicaciones móviles híbridas.

## Limitaciones y advertencias

- **Compatibilidad de versiones**: los archivos `.pte` se exportaron con ExecuTorch v1.3.1; no se garantiza compatibilidad hacia adelante. Versiones anteriores del runtime pueden no funcionar.
- **Voz fija por idioma**: el modelo ofrece una única voz por idioma, sin posibilidad de elegir entre múltiples voces o estilos dentro del mismo idioma.
- **Sesgos potenciales**: no se han documentado sesgos específicos, pero al ser un modelo TTS, puede tener limitaciones en la pronunciación de nombres propios, acentos regionales o jerga técnica.
- **Riesgo de alucinación**: en TTS, el riesgo de alucinación se manifiesta como errores de pronunciación o entonación inapropiada. No se han publicado evaluaciones de robustez.
- **Restricciones de licencia**: la licencia OpenRAIL permite uso comercial, pero puede imponer restricciones sobre usos considerados perjudiciales (p. ej., suplantación de voz). Se recomienda revisar los términos completos de OpenRAIL antes de su uso en producción.
- **Uso fuera de React Native**: si se desea utilizar el modelo fuera del paquete `react-native-executorch`, es necesario asegurar la compatibilidad del runtime con la versión de ExecuTorch usada en la exportación, siguiendo los scripts de ejemplo proporcionados.

## Enlaces

- [HuggingFace: software-mansion/react-native-executorch-supertonic](https://huggingface.co/software-mansion/react-native-executorch-supertonic)
- [Repositorio React Native ExecuTorch](https://github.com/software-mansion/react-native-executorch)
- [Modelo base: Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3)
