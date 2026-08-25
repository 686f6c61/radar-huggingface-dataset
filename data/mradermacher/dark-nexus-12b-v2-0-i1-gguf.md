# mradermacher/Dark-Nexus-12B-v2.0-i1-GGUF

## Resumen

Dark-Nexus-12B-v2.0 es un modelo de lenguaje de 12 000 millones de parámetros desarrollado por el usuario ReadyArt, diseñado específicamente para roleplay, narrativa interactiva y generación de contenido explícito sin alineamiento. La versión `i1-GGUF` es una cuantización realizada por mradermacher que incluye archivos con matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión. El modelo base está pensado para escenarios de rol sin restricciones, con soporte para ERP (roleplay erótico) y contenido considerado "peligroso" o "no alineado", lo que lo hace relevante para comunidades que buscan modelos no censurados. Aunque no se detalla la arquitectura interna, por el tamaño y el formato se trata de un transformer denso, con una ventana de contexto de 33 000 tokens según fuentes externas. La licencia es "other", lo que implica restricciones no especificadas que deben revisarse antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso de 12B, sin detalle de variante) |
| Parametros totales | 12 247 782 400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 33 000 tokens (segun Antbase) |
| Tipos de cuantizacion | GGUF: i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (tambien version estatica en otro repo) |
| Idiomas soportados | ingles (en) |
| Licencia | other (no especificada; se recomienda asumir uso no comercial) |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |

## Arquitectura y entrenamiento

No se ha publicado informacion detallada sobre la arquitectura del modelo base. Dado el tamano de 12,2 B, se trata de un transformer denso, probablemente basado en una arquitectura similar a Llama o Mistral, pero no se confirma. Tampoco se dispone de datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF/DPO) o innovaciones tecnicas. La cuantizacion fue realizada por mradermacher con matriz de importancia (imatrix), que optimiza la distribucion de pesos para cuantizaciones de baja precision, mejorando la perplejidad en esos casos. No se ha publicado ningun paper ni documentacion tecnica adicional.

## Capacidades

- Generacion de texto narrativo y dialogado para roleplay, con estilo conversacional.
- Soporte de contenido explicito y sin censura (ERP, NSFW) cuando el usuario lo solicita.
- Capacidad de seguir instrucciones en ingles para escenarios de ficcion.
- No se menciona soporte de tool calling, function calling ni capacidades de agente.
- No se indica soporte multimodal (vision, audio, etc.).
- Multilingue: solo ingles confirmado.

## Casos de uso

- **Roleplay narrativo sin restricciones**: el modelo puede generar dialogos y descripciones para partidas de rol o ficcion interactiva, manteniendo la coherencia en contextos largos gracias a su ventana de 33K tokens.
- **Escritura creativa explicita**: escritores que necesitan generar contenido adulto o transgresor pueden usarlo como herramienta de borrador, aunque deben revisar la licencia.
- **Simulacion de personajes en chats**: para aplicaciones de chat con personajes virtuales (chatbots de rol) en ingles, sin filtros de contenido.
- **Exploracion de limites de modelos sin alineacion**: investigacion en seguridad de IA para estudiar comportamientos de modelos no alineados en contextos controlados (con permisos eticos).
- **Creacion de mundos de ficcion**: el modelo puede generar trasfondos, dialogos y tramas para novelas o juegos, siempre que el contenido sea legal y etico en la jurisdiccion del usuario.
- **Pruebas de cuantizacion GGUF**: para desarrolladores que quieran evaluar el impacto de distintas cuantizaciones (IQ1, Q4, Q6) en la calidad de generacion de un modelo de 12B en hardware local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- **VRAM estimada**: con cuantizacion Q4_K_M (7.6 GB) se puede ejecutar en tarjetas de 12 GB (ej. RTX 3060 12GB, RTX 4070) con espacio para contexto. Con Q6_K (10.2 GB) se requiere 16 GB o mas. Las cuantizaciones IQ1/IQ2 (3.3-5 GB) pueden funcionar en GPU de 8 GB, pero con calidad reducida.
- **GPUs recomendadas**: RTX 4090 (24 GB) para ejecutar con cuantizaciones altas y contexto largo sin offloading; tambien A100/H100 para despliegue profesional.
- **Consumer**: si, cabe en GPUs de gama media con cuantizaciones Q4 o menores.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a formato compatible), llama-cpp-python para integraciones.
- **Latencia**: no disponible. Para un modelo de 12B en GPU moderna, se espera entre 20-50 tokens/s con cuantizacion Q4, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables especificos de la misma categoria (roleplay sin alineacion). Alternativas conocidas son modelos como `Nous-Capybara-13B` o `Sao10K/Llama-3.1-8B-Lexi-Uncensored`, pero no se tienen datos objetivos de rendimiento para comparar. Se recomienda evaluar manualmente con el propio caso de uso.

## Limitaciones y advertencias

- **Contenido peligroso**: el modelo esta etiquetado como "dangerous" y "unaligned", lo que significa que puede generar contenido violento, ilegal o perjudicial si se le solicita. No debe usarse en entornos de produccion sin filtros de seguridad.
- **Sesgos y alucinaciones**: al ser un modelo de rol sin alineacion, puede presentar sesgos amplificados y alucinaciones frecuentes, especialmente en cuantizaciones bajas.
- **Idioma**: solo ingles; no funciona bien en otros idiomas.
- **Licencia**: "other" no especifica. No se recomienda uso comercial sin consultar al autor original (ReadyArt).
- **Riesgo de reproducibilidad**: al ser un modelo de rol, no es apto para tareas de razonamiento o codigo de produccion; su uso debe limitarse a fines creativos y de entretenimiento.

## Enlaces

- Repositorio GGUF con imatrix: https://huggingface.co/mradermacher/Dark-Nexus-12B-v2.0-i1-GGUF
- Repositorio GGUF estatico: https://huggingface.co/mradermacher/Dark-Nexus-12B-v2.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Nexus-12B-v2.0/tree/main
- Referencia de contexto en Antbase: https://antbase.ai/models/dark-nexus-12b-v2-0
