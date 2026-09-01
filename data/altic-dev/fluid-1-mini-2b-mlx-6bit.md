# altic-dev/Fluid-1-Mini-2B-MLX-6bit

## Resumen

Fluid-1 Mini 2B es un checkpoint en formato MLX, cuantizado a 6 bits, desarrollado por ALTIC para su uso exclusivo dentro de la aplicación FluidVoice, un sistema de dictado por voz para macOS que funciona completamente en local. El modelo deriva de Qwen3.5-2B, un transformer de aproximadamente 2.000 millones de parámetros, y ha sido adaptado para tareas de limpieza y post-procesamiento de transcripciones de voz, incluyendo formateo inteligente, capitalización contextual y corrección de puntuación. Su nombre incluye la referencia "96k Q6", lo que sugiere una ventana de contexto de 96.000 tokens y una cuantización de 6 bits.

La relevancia de este modelo radica en su enfoque específico para el dictado en dispositivos Apple, aprovechando el framework MLX para ejecución eficiente en hardware de Apple Silicon. Sin embargo, su licencia es extremadamente restrictiva: solo se permite su uso a través de aplicaciones FluidVoice oficiales, lo que limita su aplicabilidad en otros contextos. A pesar de su pequeño tamaño, está diseñado para ofrecer mejoras de calidad en la transcripción de voz sin necesidad de conexión a la nube, garantizando la privacidad de los datos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-2B) |
| Parametros totales | 408.672.576 (checkpoint cuantizado; modelo base Qwen3.5-2B con ~2B parametros) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 96.000 tokens (segun nombre del checkpoint) |
| Tipos de cuantizacion | 6-bit (Q6) |
| Idiomas soportados | No disponible |
| Licencia | altic-fluidvoice-apps-only (uso restringido a aplicaciones FluidVoice oficiales) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es una adaptacion cuantizada de Qwen3.5-2B, un transformer denso de aproximadamente 2.000 millones de parametros. El checkpoint se distribuye en formato MLX, el framework de aprendizaje automatico de Apple para Apple Silicon, y ha sido cuantizado a 6 bits para reducir su huella de memoria y permitir su ejecucion en dispositivos locales. No se dispone de informacion detallada sobre el proceso de entrenamiento, el dataset utilizado ni las tecnicas de ajuste (como RLHF o DPO). El nombre del checkpoint menciona "FluidDecode + DFlash v2", lo que sugiere la integracion de tecnicas de decodificacion especificas para mejorar la calidad del texto generado a partir de transcripciones de voz, aunque no se han publicado detalles tecnicos sobre estas tecnicas.

## Capacidades

- Limpieza y post-procesamiento de transcripciones de voz: el modelo esta disenado para corregir y mejorar el texto generado por sistemas de reconocimiento de voz, incluyendo la eliminacion de errores tipicos del dictado.
- Formateo inteligente: aplica reglas de formato automatico, como la insercion de puntuacion, parrafos y listas, basandose en el contexto del texto dictado.
- Capitalizacion contextual: ajusta las mayusculas de forma coherente con el significado y la estructura de las frases.
- Procesamiento de texto conversacional: al derivar de Qwen3.5-2B, conserva capacidades genericas de generacion de texto, aunque su uso principal esta orientado al dictado.
- Ejecucion en local: gracias a su cuantizacion y al formato MLX, puede ejecutarse en dispositivos Apple sin conexion a internet, garantizando la privacidad de los datos.
- Integracion con FluidVoice: esta optimizado para funcionar dentro del ecosistema FluidVoice, aprovechando su runtime local de IA.

## Casos de uso

- Dictado de documentos en macOS: el modelo se integra en FluidVoice para convertir voz en texto con formato automatico, permitiendo a usuarios redactar correos, informes o articulos sin tocar el teclado.
- Transcripcion de reuniones y entrevistas: al recibir la transcripcion bruta de un sistema de reconocimiento de voz, el modelo la limpia, corrige puntuacion y estructura el contenido en parrafos coherentes.
- Creacion de notas rapidas: los usuarios pueden dictar ideas sueltas y el modelo las convierte en notas bien formateadas, con capitalizacion y puntuacion adecuadas.
- Asistencia a personas con movilidad reducida: al funcionar completamente en local, permite a usuarios con dificultades para escribir generar texto de forma natural y sin depender de servicios en la nube.
- Post-procesamiento de subtitulos: el modelo puede mejorar la calidad de subtitulos generados automaticamente, corrigiendo errores de puntuacion y mayusculas.
- Automatizacion de tareas de documentacion clinica o legal: en entornos donde la privacidad es critica, el dictado local con limpieza automatica del texto reduce el riesgo de filtracion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB para los pesos cuantizados (408M parametros × 0,75 bytes por parametro en 6 bits), mas overhead de ejecucion. El repositorio ocupa 3,0 GB, lo que sugiere que incluye otros archivos o versiones adicionales.
- GPU recomendadas: cualquier Mac con Apple Silicon (M1 o posterior) gracias al soporte nativo de MLX. No se requiere GPU dedicada externa.
- Compatibilidad con GPU de consumo: no aplica, ya que MLX esta disenado exclusivamente para hardware Apple.
- Opciones de despliegue: el modelo se usa a traves de FluidVoice, que integra el runtime MLX. No se documentan opciones de despliegue independientes (vLLM, llama.cpp, etc.) debido a la licencia restrictiva.
- Latencia y throughput: no se han publicado datos especificos, pero al ser un modelo de 2B cuantizado, se espera una latencia baja en Apple Silicon, adecuada para dictado en tiempo real.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, y la licencia restrictiva limita la comparacion con alternativas de proposito general.

## Limitaciones y advertencias

- Licencia extremadamente restrictiva: el uso esta permitido unicamente a traves de aplicaciones FluidVoice oficiales. Cualquier uso fuera de este ecosistema esta prohibido, lo que impide su integracion en proyectos propios o su redistribucion.
- Dependencia del ecosistema FluidVoice: el modelo no es autonomo; requiere el runtime de FluidVoice para funcionar, lo que limita su portabilidad.
- Sesgos del modelo base: al derivar de Qwen3.5-2B, puede heredar sesgos presentes en los datos de entrenamiento de Qwen, aunque no se han documentado evaluaciones especificas.
- Riesgo de alucinacion: como modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en contextos ambiguos, aunque su uso principal (limpieza de dictado) reduce este riesgo al operar sobre texto ya transcrito.
- Idiomas soportados: no se ha especificado que idiomas maneja, por lo que su rendimiento en lenguas distintas del ingles o el chino (idiomas principales de Qwen) es incierto.
- Sin informacion sobre entrenamiento: no se conocen los datos de entrenamiento ni las tecnicas de ajuste, lo que dificulta evaluar su robustez en escenarios de produccion.

## Enlaces

- [HuggingFace - altic-dev/Fluid-1-Mini-2B-MLX-6bit](https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-6bit)
- [FluidVoice - sitio oficial](https://altic.dev/fluid)
- [GitHub - altic-dev/FluidVoice](https://github.com/altic-dev/FluidVoice)
- [Terminos de licencia ALTIC](https://huggingface.co/altic-dev/Fluid-1-Mini-2B-MLX-6bit/blob/main/ALTIC-MODEL-TERMS.md)
