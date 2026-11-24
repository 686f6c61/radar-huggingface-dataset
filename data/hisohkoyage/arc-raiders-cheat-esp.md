# Hisohkoyage/arc-raiders-cheat-esp

## Resumen

El repositorio `Hisohkoyage/arc-raiders-cheat-esp` alojado en Hugging Face no contiene un modelo de inteligencia artificial ni pesos entrenados. Se trata de un paquete distribuible para Windows de 64 bits presentado como herramienta de trampas (cheat) para el videojuego *Arc Raiders*, con funcionalidades descritas de ESP (Extra Sensory Perception), radar 2D y filtrado de botín. El contenido es un ejecutable y un archivo ZIP alojado originalmente en un repositorio de GitHub ajeno (`LarissaWatanabe/arc-raiders-cheat-esp`), redistribuido bajo etiqueta de licencia MIT.

La ficha se redacta por rigor documental: la plataforma Hugging Face está diseñada para modelos de aprendizaje automático, y este artefacto no lo es. No hay arquitectura de red neuronal, parámetros, tokenizador, contexto ni dataset. Por tanto, la mayor parte de los campos técnicos solicitados se marcan como "no disponible" o "no aplica". Cualquier evaluación como modelo de IA es inviable.

Es relevante advertir de que la distribución de software de este tipo conlleva riesgos de seguridad (ejecutables sin firma, contraseñas de extracción incrustadas, enlaces a binarios de terceros) y posibles implicaciones legales según la jurisdicción y los términos de servicio del videojuego afectado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos del repo, no capacidades del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto descrito en la model card es un binario `arc-raiders-cheat-esp-v1.2.0-win64.exe` (build `v3.9.6`, identificador `B824B8`) empaquetado en un ZIP de 8,9 MB protegido con la contraseña `2026`. Según el texto del autor, incorpora un overlay externo en modo usuario, un escáner de offsets dinámicos y un radar 2D con filtros de botín, con una frecuencia de sondeo declarada de 184 Hz y un consumo de RAM inferior a 65 MB.

No hay datos de entrenamiento, ni proceso de alineación (RLHF, DPO), ni innovaciones de modelado. Las cifras de "consistencia" (96,5 %, 97,7 %, 99,9 %) que aparecen en la model card son afirmaciones comerciales del autor sin metodología verificable ni benchmarks públicos asociados.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son solo etiquetas del repositorio.
- El artefacto declara funcionalidades de overlay gráfico, radar 2D, ESP con cajas delimitadoras y esqueletos, y un mecanismo de descarga de emergencia mediante la tecla `END`.

## Casos de uso

No procede enumerar casos de uso como modelo de IA. El artefacto no ofrece ninguna funcionalidad de procesamiento de lenguaje, visión artificial entrenada ni inferencia sobre datos. Cualquier uso descrito por el autor se circunscribe a la manipulación de un videojuego concreto y queda fuera del ámbito de esta ficha técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen métricas tipo MMLU, HumanEval, GSM8K ni equivalentes. Las cifras de "consistencia" y "frecuencia de sondeo" citadas por el autor no son benchmarks reproducibles.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, menos de 65 MB de RAM en el proceso descrito.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de 184 Hz y 144 Hz son afirmaciones del autor sin validación independiente.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Tampoco se han identificado en la información proporcionada alternativas de la misma naturaleza que puedan compararse con rigor técnico.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se limita a documentar la discrepancia entre el contenido del repositorio y la categoría del mismo.
- Riesgo de seguridad elevado: ejecutable de Windows distribuido con contraseña de extracción incrustada en el propio README y alojado en un repositorio de GitHub de terceros; no hay verificación de integridad ni firma de código.
- Posible conflicto con los términos de servicio del videojuego *Arc Raiders* y con la legislación aplicable en materia de trampas y modificación de software en algunas jurisdicciones.
- La licencia MIT declarada cubre el metadato del repositorio, pero no aclara la titularidad del binario ni de los recursos de terceros que pueda incorporar.
- Las afirmaciones de rendimiento (96,5 %, 97,7 %, 99,9 %, 184 Hz) no son verificables ni cuentan con metodología publicada.
- No apto para uso en producción, investigación ni evaluación comparativa de modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hisohkoyage/arc-raiders-cheat-esp
- Repositorio de GitHub referenciado por el autor: https://github.com/LarissaWatanabe/arc-raiders-cheat-esp
- Releases del autor: https://github.com/LarissaWatanabe/arc-raiders-cheat-esp/releases/latest
